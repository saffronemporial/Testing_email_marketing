// supabase/functions/send_whatsapp/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM = Deno.env.get("TWILIO_WHATSAPP_NUMBER"); // e.g. +1415...

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const payload = await req.json();
    const { recipients = [], message = "", initiated_by = null, follow_up_id = null } = payload;

    if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) return new Response(JSON.stringify({ ok: false, error: "Twilio not configured" }), { status: 500 });

    const results: any[] = [];
    for (const r of recipients) {
      const phone = (r.phone || "").replace(/\D/g, "");
      if (!phone) {
        results.push({ recipient: r, ok: false, error: "missing_phone" });
        await supabase.from("communication_logs").insert([{ client_id: r.client_id ?? null, profile_id: r.profile_id ?? null, channel: 'whatsapp', message, provider_response: { error: 'missing_phone' }, status: 'failed', sent_by: initiated_by ?? null, sent_at: new Date().toISOString(), follow_up_id }]);
        continue;
      }
      const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
      const body = new URLSearchParams();
      body.append("From", `whatsapp:${TWILIO_FROM}`);
      body.append("To", `whatsapp:+${phone}`);
      body.append("Body", message);

      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: { Authorization: "Basic " + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`), "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString()
        });
        const json = await resp.json();
        await supabase.from("communication_logs").insert([{ client_id: r.client_id ?? null, profile_id: r.profile_id ?? null, channel: 'whatsapp', message, provider_response: json, status: resp.ok ? 'sent' : 'failed', provider_message_id: json?.sid ?? null, sent_by: initiated_by ?? null, sent_at: new Date().toISOString(), follow_up_id }]);
        results.push({ recipient: r, ok: resp.ok, json });
      } catch (err) {
        await supabase.from("communication_logs").insert([{ client_id: r.client_id ?? null, profile_id: r.profile_id ?? null, channel: 'whatsapp', message, provider_response: { error: String(err) }, status: 'failed', sent_by: initiated_by ?? null, sent_at: new Date().toISOString(), follow_up_id }]);
        results.push({ recipient: r, ok: false, error: String(err) });
      }
    }
    return new Response(JSON.stringify({ ok: true, results }), { status: 200 });
  } catch (err) {
    console.error("send_whatsapp function error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
});
