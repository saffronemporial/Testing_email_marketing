// template-preview/index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

/**
 * Renders a communication template using template params and profile data.
 * Expects:
 * { template_id: "<uuid or name>", profile_id: "<uuid>", extra_vars: {...} }
 *
 * This function reads communication_templates and profiles via Supabase REST.
 * To read your Supabase DB from Edge Functions, use the Admin URL + Key, or call the REST endpoint.
 * For simplicity here we expect the client to pass the template body and profile object if you don't want to expose DB keys.
 *
 * If you want DB lookups, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars and uncomment the fetch calls.
 *
 * Returns { success, subject, body, vars }
 */

function renderMustache(template: string, vars: any) {
  // simple mustache-like replacement for Deno without external libs
  return template.replace(/{{\s*([^}\s]+)\s*}}/g, (_, key) => {
    const val = key.split('.').reduce((acc: any, k: string) => (acc && acc[k] !== undefined ? acc[k] : ""), vars);
    return String(val ?? "");
  });
}

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response(JSON.stringify({ success: false, error: "only POST allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });

    const body = await req.json().catch(() => null);
    if (!body) return new Response(JSON.stringify({ success: false, error: "invalid_json" }), { status: 400, headers: { "Content-Type": "application/json" } });

    // Allow client to pass template body directly (preferred) OR template_id to lookup server-side
    const templateBody = body.template_body ?? null;
    const templateSubject = body.template_subject ?? null;
    const templateNameOrId = body.template_id ?? null;
    const profile = body.profile ?? body.profile_obj ?? {};
    const extraVars = body.extra_vars ?? {};

    let tplBody = templateBody;
    let tplSubject = templateSubject;

    // If template_id supplied and you want DB fetch, use SUPABASE values and call REST. For security, keep service role key server-side.
    if (!tplBody && templateNameOrId) {
      // Optional: fetch from Supabase using REST and SERVICE_ROLE key (uncomment if env set)
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
      const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      if (SUPABASE_URL && SUPABASE_KEY) {
        const url = `${SUPABASE_URL}/rest/v1/communication_templates?select=*&id=eq.${encodeURIComponent(templateNameOrId)}`;
        const resp = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
        if (resp.ok) {
          const rows = await resp.json();
          if (Array.isArray(rows) && rows.length > 0) {
            tplBody = rows[0].body;
            tplSubject = rows[0].subject ?? tplSubject;
          }
        }
      }
    }

    if (!tplBody) return new Response(JSON.stringify({ success: false, error: "missing_template_body" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const vars = { profile: profile ?? {}, payload: extraVars ?? {} };
    const renderedBody = renderMustache(tplBody, vars);
    const renderedSubject = tplSubject ? renderMustache(tplSubject, vars) : "";

    return new Response(JSON.stringify({ success: true, subject: renderedSubject, body: renderedBody, vars }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
