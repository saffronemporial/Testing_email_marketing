// email-send-emailjs/index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

/**
 * Sends email via EmailJS REST API. If EmailJS call fails and FALLBACK_PROXY_URL is set,
 * it will POST same payload to the proxy URL as fallback.
 *
 * Expected JSON body:
 * {
 *   "to": "user@example.com",
 *   "template_id": "your_template_id",
 *   "subject": "Optional subject override",
 *   "template_params": { ... } // variables for template
 * }
 *
 * Required env:
 * EMAILJS_SERVICE_ID, EMAILJS_USER_ID, EMAILJS_API_KEY
 * Optional env:
 * DEFAULT_FROM_EMAIL, FALLBACK_PROXY_URL
 */

async function callEmailJs(serviceId: string, templateId: string, userId: string, apiKey: string, params: any) {
  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: userId,
    template_params: params,
  };

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "origin": "http://localhost",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch (_e) { json = text; }
  return { ok: res.ok, status: res.status, body: json };
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "only POST allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ success: false, error: "invalid_json" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const to = body.to;
    const template_id = body.template_id;
    const subject = body.subject ?? body.template_params?.subject;
    const template_params = body.template_params ?? {};
    if (!to || !template_id) {
      return new Response(JSON.stringify({ success: false, error: "missing to or template_id" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const EMAILJS_SERVICE_ID = Deno.env.get("EMAILJS_SERVICE_ID") ?? "";
    const EMAILJS_USER_ID = Deno.env.get("EMAILJS_USER_ID") ?? "";
    const EMAILJS_API_KEY = Deno.env.get("EMAILJS_API_KEY") ?? "";
    const DEFAULT_FROM_EMAIL = Deno.env.get("DEFAULT_FROM_EMAIL") ?? "no-reply@yourdomain.com";
    const FALLBACK_PROXY_URL = Deno.env.get("FALLBACK_PROXY_URL") ?? "";

    if (!EMAILJS_SERVICE_ID || !EMAILJS_USER_ID || !EMAILJS_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: "emailjs_credentials_missing" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // Ensure template_params contains 'to' and optional subject to help templates
    template_params.to_email = to;
    if (subject) template_params.subject = subject;

    // Call EmailJS
    const result = await callEmailJs(EMAILJS_SERVICE_ID, template_id, EMAILJS_USER_ID, EMAILJS_API_KEY, template_params);

    if (result.ok) {
      return new Response(JSON.stringify({ success: true, provider: "emailjs", status: result.status, body: result.body }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Provider error: attempt fallback proxy if configured
    if (FALLBACK_PROXY_URL) {
      try {
        const fallbackResp = await fetch(FALLBACK_PROXY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: "emailjs", original: { to, template_id, template_params, subject }, reason: result.body }),
        });
        const ftext = await fallbackResp.text();
        let fjson: any = null;
        try { fjson = ftext ? JSON.parse(ftext) : null; } catch (_) { fjson = ftext; }
        return new Response(JSON.stringify({ success: false, provider: "emailjs", provider_status: result.status, provider_body: result.body, fallback: { ok: fallbackResp.ok, status: fallbackResp.status, body: fjson } }), { status: 502, headers: { "Content-Type": "application/json" } });
      } catch (fbErr) {
        return new Response(JSON.stringify({ success: false, error: "provider_failed_and_fallback_failed", provider_response: result.body, fallback_error: String(fbErr) }), { status: 502, headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ success: false, provider: "emailjs", provider_status: result.status, provider_body: result.body }), { status: 502, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
