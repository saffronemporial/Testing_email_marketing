// automation-manual-send/index.ts 
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

/**
 * Automation Manual Send (JWT validation + role check)
 *
 * Env required:
 * SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional:
 * FALLBACK_PROXY_URL
 *
 * ADMIN_ROLES controls allowed profile.role values.
 */

// Allowed admin roles
const ADMIN_ROLES = ["admin", "superadmin", "owner"];

// Utility: decode JWT payload without verification to check expiry quickly
function decodeJwtPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

async function getUserFromToken(supabaseUrl: string, token: string) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!resp.ok) return null;
  return resp.json();
}

async function getProfileByUserId(supabaseUrl: string, serviceKey: string, userId: string) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=*`;
  const resp = await fetch(url, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!resp.ok) return null;
  const rows = await resp.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function insertPendingAction(supabaseUrl: string, serviceKey: string, payload: any) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/pending_actions`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  const text = await resp.text();
  try { return { ok: resp.ok, status: resp.status, body: JSON.parse(text || "null") }; } catch { return { ok: resp.ok, status: resp.status, body: text || null }; }
}

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response(JSON.stringify({ success: false, error: "only POST allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });

    const authHeader = req.headers.get("authorization") ?? "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) return new Response(JSON.stringify({ success: false, error: "missing_authorization_header" }), { status: 401, headers: { "Content-Type": "application/json" } });
    const token = match[1];

    // quick JWT decode to check expiry client-side
    const payload = decodeJwtPayload(token);
    if (!payload || (payload.exp && Date.now() >= (payload.exp * 1000))) {
      return new Response(JSON.stringify({ success: false, error: "token_expired_or_invalid" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const FALLBACK_PROXY_URL = Deno.env.get("FALLBACK_PROXY_URL") ?? "";

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return new Response(JSON.stringify({ success: false, error: "supabase_env_missing" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // Validate token with Supabase auth endpoint (ensures token legitimate)
    const user = await getUserFromToken(SUPABASE_URL, token);
    if (!user?.id) return new Response(JSON.stringify({ success: false, error: "invalid_token" }), { status: 401, headers: { "Content-Type": "application/json" } });

    // Fetch profile using service role key and check role membership
    const profile = await getProfileByUserId(SUPABASE_URL, SUPABASE_KEY, user.id);
    if (!profile) return new Response(JSON.stringify({ success: false, error: "profile_not_found" }), { status: 403, headers: { "Content-Type": "application/json" } });
    if (!ADMIN_ROLES.includes(String(profile.role ?? "").toLowerCase())) {
      return new Response(JSON.stringify({ success: false, error: "forbidden_not_admin", role: profile.role }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => null);
    if (!body) return new Response(JSON.stringify({ success: false, error: "invalid_json" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const mode = body.mode ?? "enqueue";
    const channel = body.channel ?? "email";
    const template_id = body.template_id;
    const recipients = Array.isArray(body.recipients) ? body.recipients : [];
    const globalParams = body.template_params ?? {};

    if (!template_id) return new Response(JSON.stringify({ success: false, error: "missing_template_id" }), { status: 400, headers: { "Content-Type": "application/json" } });
    if (!recipients.length) return new Response(JSON.stringify({ success: false, error: "no_recipients" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const results: any[] = [];
    for (const r of recipients) {
      const job = {
        id: crypto.randomUUID(),
        event_source: "manual_send",
        event_table: `manual_${channel}`,
        event_type: "manual_send",
        event_payload: { template_id, channel, recipient: r, template_params: { ...(globalParams || {}), ...(r.template_params || {}) } },
        status: mode === "enqueue" ? "pending" : "processing",
        attempts: 0,
        created_at: new Date().toISOString(),
        next_run_at: new Date().toISOString()
      };

      if (mode === "enqueue") {
        const ins = await insertPendingAction(SUPABASE_URL, SUPABASE_KEY, job);
        results.push({ recipient: r, op: "enqueue", inserted: ins });
        continue;
      }

      // direct mode: call provider function (internal invocation)
      const fnName = channel === "whatsapp" ? "whatsapp-send-twilio" : "email-send-emailjs";
      const providerUrl = `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/${fnName}`;
      try {
        const resp = await fetch(providerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
          body: JSON.stringify({ to: r.email ?? r.phone ?? null, template_id, template_params: { ...(globalParams || {}), ...(r.template_params || {}) }, profile: r })
        });
        const text = await resp.text();
        let parsed = null;
        try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
        results.push({ recipient: r, op: "direct", status: resp.status, body: parsed });
      } catch (errCall) {
        if (FALLBACK_PROXY_URL) {
          try {
            const fb = await fetch(FALLBACK_PROXY_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: fnName, original: job, error: String(errCall) }) });
            const ftext = await fb.text();
            let fjson = null;
            try { fjson = ftext ? JSON.parse(ftext) : null; } catch { fjson = ftext; }
            results.push({ recipient: r, op: "direct_fallback", fallback_status: fb.status, fallback_body: fjson });
          } catch (fbErr) {
            results.push({ recipient: r, op: "direct_error", error: String(errCall), fallback_error: String(fbErr) });
          }
        } else {
          results.push({ recipient: r, op: "direct_error", error: String(errCall) });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
