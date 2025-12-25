// supabase/functions/send_email/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

// EmailJS server-side config
const EMAILJS_SERVICE_ID = Deno.env.get("EMAILJS_SERVICE_ID");
const EMAILJS_TEMPLATE_ID = Deno.env.get("EMAILJS_TEMPLATE_ID");
const EMAILJS_USER_ID = Deno.env.get("EMAILJS_USER_ID"); // public key same param

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const payload = await req.json();
    const { recipients = [], subject = "", message = "", template_id = null, initiated_by = null, follow_up_id = null } = payload;

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_USER_ID) {
      return new Response(JSON.stringify({ ok: false, error: "EmailJS not configured" }), { status: 500 });
    }
    // iterate recipients server-side and call EmailJS HTTP endpoint
    const results: any[] = [];
    for (const r of recipients) {
      const to = r.email;
      if (!to) {
        results.push({ recipient: r, ok: false, error: "missing_email" });
        continue;
      }
      try {
        const resp = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID,
            template_id: template_id || EMAILJS_TEMPLATE_ID,
            user_id: EMAILJS_USER_ID,
            template_params: { to_email: to, to_name: r.full_name || "", subject, message },
          }),
        });
        const json = await resp.text();
        const ok = resp.ok;
        // log into supabase
        await supabase.from("communication_logs").insert([{
          client_id: r.client_id ?? null,
          profile_id: r.profile_id ?? null,
          channel: 'email',
          subject,
          message,
          provider_response: json,
          status: ok ? 'sent' : 'failed',
          sent_by: initiated_by ?? null,
          sent_at: new Date().toISOString(),
          follow_up_id
        }]);
        results.push({ recipient: r, ok, json });
      } catch (err) {
        await supabase.from("communication_logs").insert([{
          client_id: r.client_id ?? null,
          profile_id: r.profile_id ?? null,
          channel: 'email',
          subject,
          message,
          provider_response: { error: String(err) },
          status: 'failed',
          sent_by: initiated_by ?? null,
          sent_at: new Date().toISOString(),
          follow_up_id
        }]);
        results.push({ recipient: r, ok: false, error: String(err) });
      }
    }
    return new Response(JSON.stringify({ ok: true, results }), { status: 200 });
  } catch (err) {
    console.error("send_email function error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
});
