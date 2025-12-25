// automation-trigger/index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

/**
 * Lightweight edge function to accept an event and insert into pending_actions table.
 * This function expects to be called with service-role key (or be restricted).
 * If you want to expose publicly, validate and restrict input.
 *
 * Body:
 * { id: "<uuid optional>", event_table: "orders", event_type: "INSERT", event_payload: {...} }
 *
 * Required env:
 * SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response(JSON.stringify({ success: false, error: "only POST allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });

    const body = await req.json().catch(() => null);
    if (!body) return new Response(JSON.stringify({ success: false, error: "invalid_json" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!SUPABASE_URL || !SUPABASE_KEY) return new Response(JSON.stringify({ success: false, error: "supabase_env_missing" }), { status: 500, headers: { "Content-Type": "application/json" } });

    const id = body.id ?? crypto.randomUUID();
    const event_table = body.event_table;
    const event_type = body.event_type ?? null;
    const event_payload = body.event_payload ?? {};

    if (!event_table) return new Response(JSON.stringify({ success: false, error: "missing event_table" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const insertBody = {
      id,
      event_source: "edge_function",
      event_table,
      event_type,
      event_payload,
      status: "pending",
      attempts: 0,
      created_at: new Date().toISOString(),
      next_run_at: new Date().toISOString()
    };

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/pending_actions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=representation"
      },
      body: JSON.stringify(insertBody),
    });

    const text = await resp.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch (_) { json = text; }

    if (!resp.ok) {
      return new Response(JSON.stringify({ success: false, error: "supabase_insert_failed", status: resp.status, body: json }), { status: 502, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, inserted: json }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
