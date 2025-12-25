// supabase/functions/retries/retry/index.ts
// Supabase Edge Function (Deno) — retry communication by communication_log id.
// It will read the communication_logs row, attempt to resend (twilio/emailjs server-side),
// write new log entries, and update communication_logs status.
// ENV needed:
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
// EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY (optional)

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Twilio server send
async function twilioSend(to: string, body: string) {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_WHATSAPP_NUMBER");
  if (!sid || !token || !from) return { ok: false, error: "Twilio not configured" };
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const params = new URLSearchParams();
  params.append("From", `whatsapp:${from}`);
  params.append("To", `whatsapp:${to}`);
  params.append("Body", body);
  const resp = await fetch(url, { method: "POST", headers: { Authorization: "Basic " + btoa(`${sid}:${token}`), "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString() });
  const json = await resp.json();
  return { ok: resp.ok, json };
}

// EmailJS server-side
async function emailjsSend(toEmail: string, subject: string, message: string) {
  const service = Deno.env.get("EMAILJS_SERVICE_ID");
  const template = Deno.env.get("EMAILJS_TEMPLATE_ID");
  const user = Deno.env.get("EMAILJS_PUBLIC_KEY");
  if (!service || !template || !user) return { ok: false, error: "EmailJS not configured" };
  try {
    const resp = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: service, template_id: template, user_id: user, template_params: { to_email: toEmail, subject, message } })
    });
    const json = await resp.json();
    return { ok: resp.ok, json };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const payload = await req.json();
    const commId = payload.communication_log_id;
    if (!commId) return new Response(JSON.stringify({ error: "communication_log_id required" }), { status: 400 });

    // fetch communication log
    const { data: commRow, error } = await supabase.from("communication_logs").select("*").eq("id", commId).single();
    if (error || !commRow) return new Response(JSON.stringify({ error: "communication not found" }), { status: 404 });

    // prepare send
    const channel = commRow.channel;
    const recipientPhone = commRow.provider_response?.to || commRow.provider_response?.to_phone || null;
    const recipientEmail = commRow.provider_response?.to || commRow.provider_response?.to_email || commRow.profile_id ? null : null; // fallback logic

    let sendResult = null;
    if (channel === "whatsapp") {
      // try to infer phone: use the profile's phone if not present
      let phone = recipientPhone;
      if (!phone && commRow.profile_id) {
        const { data: prof } = await supabase.from("profiles").select("phone").eq("id", commRow.profile_id).single();
        phone = prof?.phone || null;
      }
      if (!phone) {
        await supabase.from("communication_logs").update({ status: "failed", provider_response: { error: "no_phone" } }).eq("id", commId);
        return new Response(JSON.stringify({ ok: false, error: "no phone found for retry" }), { status: 400 });
      }
      sendResult = await twilioSend(phone, commRow.message || (commRow.subject || ""));
    } else if (channel === "email") {
      // try profile's email if needed
      let email = commRow.provider_response?.to_email || commRow.profile_id ? null : null;
      if (!email && commRow.profile_id) {
        const { data: prof } = await supabase.from("profiles").select("email").eq("id", commRow.profile_id).single();
        email = prof?.email || null;
      }
      if (!email) {
        await supabase.from("communication_logs").update({ status: "failed", provider_response: { error: "no_email" } }).eq("id", commId);
        return new Response(JSON.stringify({ ok: false, error: "no email found for retry" }), { status: 400 });
      }
      sendResult = await emailjsSend(email, commRow.subject || "Message", commRow.message || "");
    } else {
      // unsupported channel
      await supabase.from("communication_logs").update({ status: "failed", provider_response: { error: "unsupported_channel" } }).eq("id", commId);
      return new Response(JSON.stringify({ ok: false, error: "unsupported channel for retry" }), { status: 400 });
    }

    // Persist result in logs
    await supabase.from("communication_logs").update({
      provider_response: sendResult.json ?? { error: sendResult.error ?? null },
      status: sendResult.ok ? "sent" : "failed",
      provider_message_id: sendResult.json?.sid || null,
      sent_at: new Date().toISOString()
    }).eq("id", commId);

    // Also mirror to client_communications for CRM if present
    await supabase.from("client_communications").insert([{
      client_id: commRow.client_id ?? null,
      communication_type: channel,
      subject: commRow.subject ?? null,
      message: commRow.message ?? null,
      media_url: null,
      sent_at: new Date().toISOString(),
      sent_by: null,
      status: sendResult.ok ? "sent" : "failed",
      template_used: null,
      ai_enhanced: false,
      response_data: sendResult.json ?? { error: sendResult.error ?? null },
      created_at: new Date().toISOString(),
      follow_up_id: commRow.follow_up_id ?? null
    }]);

    return new Response(JSON.stringify({ ok: !!sendResult.ok, result: sendResult }), { status: sendResult.ok ? 200 : 500 });
  } catch (err) {
    console.error("retry function error", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
