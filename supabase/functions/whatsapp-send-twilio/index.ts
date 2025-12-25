// whatsapp-send-twilio/index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

/**
 * Send WhatsApp message using Twilio REST API (no Twilio SDK).
 * Required env:
 * TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM (e.g., 'whatsapp:+1415...')
 * Optional:
 * FALLBACK_PROXY_URL
 *
 * Body:
 * { to: '+91xxxxxxxxxx', body: 'Hello message', media_urls: ['https://...'] }
 */

async function twilioSend(accountSid: string, authToken: string, from: string, to: string, bodyText: string, mediaUrls?: string[]) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const form = new URLSearchParams();
  form.append("From", from);
  form.append("To", `whatsapp:${to.startsWith("whatsapp:") ? to.replace(/^whatsapp:/, "") : to}`);
  form.append("Body", bodyText ?? "");
  if (Array.isArray(mediaUrls)) {
    mediaUrls.forEach((m) => form.append("MediaUrl", m));
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/x-www-form-urlencoded");
  const basic = btoa(`${accountSid}:${authToken}`);
  headers.set("Authorization", `Basic ${basic}`);

  const resp = await fetch(url, { method: "POST", headers, body: form.toString() });
  const text = await resp.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch (_e) { json = text; }
  return { ok: resp.ok, status: resp.status, body: json };
}

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response(JSON.stringify({ success: false, error: "only POST allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });

    const payload = await req.json().catch(() => null);
    if (!payload) return new Response(JSON.stringify({ success: false, error: "invalid_json" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const to = payload.to;
    const bodyText = payload.body ?? payload.message ?? "";
    const media = payload.media_urls ?? [];
    if (!to || !bodyText) return new Response(JSON.stringify({ success: false, error: "missing to or body" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
    const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") ?? "";
    const FALLBACK_PROXY_URL = Deno.env.get("FALLBACK_PROXY_URL") ?? "";

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
      return new Response(JSON.stringify({ success: false, error: "twilio_credentials_missing" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // Normalize phone: remove spaces, ensure + prefix
    const normalize = (s: string) => String(s).replace(/[^\d+]/g, "").replace(/^00/, "+");
    const toNormalized = normalize(to);
    if (!toNormalized || !/^\+?\d{8,15}$/.test(toNormalized)) {
      return new Response(JSON.stringify({ success: false, error: "invalid_phone" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const res = await twilioSend(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, toNormalized, bodyText, media);

    if (res.ok) return new Response(JSON.stringify({ success: true, provider: "twilio", status: res.status, body: res.body }), { status: 200, headers: { "Content-Type": "application/json" } });

    // fallback to proxy if configured
    if (FALLBACK_PROXY_URL) {
      try {
        const fallback = await fetch(FALLBACK_PROXY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: "twilio", original: payload, reason: res.body }),
        });
        const ftext = await fallback.text();
        let fjson: any = null;
        try { fjson = ftext ? JSON.parse(ftext) : null; } catch (_) { fjson = ftext; }
        return new Response(JSON.stringify({ success: false, provider: "twilio", provider_status: res.status, provider_body: res.body, fallback: { ok: fallback.ok, status: fallback.status, body: fjson } }), { status: 502, headers: { "Content-Type": "application/json" } });
      } catch (fbErr) {
        return new Response(JSON.stringify({ success: false, error: "provider_failed_and_fallback_failed", provider_response: res.body, fallback_error: String(fbErr) }), { status: 502, headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ success: false, provider: "twilio", status: res.status, body: res.body }), { status: 502, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
