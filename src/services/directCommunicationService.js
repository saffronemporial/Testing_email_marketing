/* src/services/directCommunicationService.js
 *
 * Unified, browser-safe messaging + follow-up helper for Saffron Emporial.
 *
 * Usage:
 *  import DCS from 'src/services/directCommunicationService';
 *  await DCS.sendBulkEmail({ recipients, subject, message, refineWithGemini: true, initiated_by: profileId });
 *  await DCS.sendBulkWhatsApp({ recipients, message, initiated_by: profileId });
 *  await DCS.createBulkFollowUps({ recipients, followupData, created_by });
 *
 * recipients array format (each item):
 *  {
 *    client_id: "<uuid>" OR null,
 *    profile_id: "<uuid>",    // required for follow-ups created by helper
 *    full_name: "Name",
 *    email: "a@b.com",
 *    phone: "+919xxxxxxxx",
 *    opt_out: false
 *  }
 *
 * Environment variables (Vite .env):
 *  VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY
 *  VITE_TWILIO_ACCOUNT_SID, VITE_TWILIO_AUTH_TOKEN, VITE_TWILIO_WHATSAPP_NUMBER
 *  VITE_GEMINI_PROXY  (e.g. http://localhost:3001)
 *  VITE_API_BASE_URL (Edge base url) - optional, if not set direct mode used
 *  VITE_MAX_RECIPIENTS (default 1000), VITE_COOLDOWN_SECONDS (default 30)
 *
 * NOTE: For production, hide Twilio / Email secrets on server; deploy Edge function endpoints and set VITE_API_BASE_URL to enable secure mode.
 */

import emailjs from "emailjs-com";
import { supabase } from "../supabaseClient"; // adjust if path differs

/*********************
 * Configuration
 *********************/
const CONFIG = {
  emailjs: {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  },
  twilio: {
    sid: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
    token: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
    from: import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER, // e.g. +1415...
  },
  gemini: {
    proxyBase: import.meta.env.VITE_GEMINI_PROXY || "http://localhost:3001",
  },
  edge: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "", // if set, attempt to use Edge endpoints
  },
  limits: {
    maxRecipients: Number(import.meta.env.VITE_MAX_RECIPIENTS || 1000),
    cooldownSeconds: Number(import.meta.env.VITE_COOLDOWN_SECONDS || 30),
  },
};

/*********************
 * Internal state
 *********************/
let EDGE_AVAILABLE = false;
const COOLDOWN_TRACKER = {
  email: 0,
  whatsapp: 0,
  gemini: 0,
}; // stores timestamp ms until which button is locked

/*********************
 * Helpers
 *********************/
function nowIso() {
  return new Date().toISOString();
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function b64Auth(sid, token) {
  return btoa(`${sid}:${token}`);
}
function isValidEmail(email) {
  return !!(email && String(email).includes("@"));
}
function cleanPhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return null;
  // naive E.164: ensure '+' and country code present — ideally store E.164 in DB
  return digits.startsWith("+") ? digits : `+${digits.replace(/^0+/, "")}`;
}
function enforceMaxRecipients(recipients = []) {
  if (!Array.isArray(recipients)) return [];
  return recipients.slice(0, CONFIG.limits.maxRecipients);
}
function isOptedOut(recipient) {
  return !!recipient.opt_out;
}

/*********************
 * Logging (dual)
 *********************/
async function insertCommunicationLog(row) {
  // fit to communication_logs structure
  try {
    await supabase.from("communication_logs").insert([row]);
  } catch (err) {
    console.warn("communication_logs insert failed", err);
  }
}
async function insertClientCommunication(row) {
  // fit to client_communications structure
  try {
    await supabase.from("client_communications").insert([row]);
  } catch (err) {
    console.warn("client_communications insert failed", err);
  }
}
async function dualLog(payload) {
  // payload fields we expect: client_id, profile_id, channel, subject, message,
  // provider_response, status, provider_message_id, sent_by, sent_at, follow_up_id, ai_enhanced
  try {
    await Promise.all([
      insertCommunicationLog({
        client_id: payload.client_id ?? null,
        profile_id: payload.profile_id ?? null,
        channel: payload.channel ?? payload.communication_type ?? "email",
        template_id: payload.template_id ?? null,
        subject: payload.subject ?? null,
        message: payload.message ?? null,
        provider_response: payload.provider_response ?? null,
        status: payload.status ?? "queued",
        provider_message_id: payload.provider_message_id ?? null,
        sent_by: payload.sent_by ?? null,
        sent_at: payload.sent_at ?? nowIso(),
        created_at: nowIso(),
        follow_up_id: payload.follow_up_id ?? null,
      }),
      insertClientCommunication({
        client_id: payload.client_id ?? null,
        communication_type: payload.channel ?? payload.communication_type ?? "email",
        subject: payload.subject ?? null,
        message: payload.message ?? null,
        media_url: payload.media_url ?? null,
        sent_at: payload.sent_at ?? nowIso(),
        sent_by: payload.sent_by ?? null,
        status: payload.status ?? "queued",
        template_used: payload.template_id ?? null,
        ai_enhanced: !!payload.ai_enhanced,
        response_data: payload.provider_response ?? null,
        created_at: nowIso(),
        follow_up_id: payload.follow_up_id ?? null,
      }),
    ]);
  } catch (err) {
    console.warn("dualLog failure", err);
  }
}

/*********************
 * Edge health check
 *********************/
async function checkEdgeHealth() {
  const base = CONFIG.edge.baseUrl;
  if (!base) {
    EDGE_AVAILABLE = false;
    return false;
  }
  try {
    const url = base.replace(/\/$/, "") + "/health";
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      EDGE_AVAILABLE = false;
      return false;
    }
    const json = await res.json();
    EDGE_AVAILABLE = !!json?.ok;
    return EDGE_AVAILABLE;
  } catch (err) {
    EDGE_AVAILABLE = false;
    return false;
  }
}

/*********************
 * Gemini refine wrapper
 *********************/
export async function refineWithGemini({ text = "", tone = "professional", language = "en" } = {}) {
  // cooldown for gemini
  const until = COOLDOWN_TRACKER.gemini || 0;
  if (Date.now() < until) throw new Error(`Gemini cooldown active. Wait ${Math.ceil((until - Date.now()) / 1000)}s`);
  COOLDOWN_TRACKER.gemini = Date.now() + CONFIG.limits.cooldownSeconds * 1000;

  const proxy = CONFIG.gemini.proxyBase.replace(/\/$/, "");
  const url = `${proxy}/api/refine`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, tone, language }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Gemini refine failed");
    return json; // expected shape: { refined_text, prompt_used, tokens }
  } catch (err) {
    throw err;
  }
}

/*********************
 * Edge call helper
 *********************/
async function callEdge(endpointPath, payload = {}) {
  // attempts to call Edge API and returns { ok, json }
  if (!(await checkEdgeHealth())) {
    return { ok: false, error: "Edge not available" };
  }
  const base = CONFIG.edge.baseUrl.replace(/\/$/, "");
  const url = `${base}${endpointPath.startsWith("/") ? endpointPath : "/" + endpointPath}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return { ok: res.ok, json, status: res.status };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/*********************
 * Email sending (single + bulk)
 *********************/

// send single email via EmailJS (client)
async function sendEmailViaEmailJSSingle({ toEmail, toName = "", subject = "", message = "", templateId = null, publicKey = null }) {
  if (!CONFIG.emailjs.serviceId || (!templateId && !CONFIG.emailjs.templateId) || !CONFIG.emailjs.publicKey) {
    throw new Error("EmailJS not configured (missing env vars)");
  }
  try {
    emailjs.init(CONFIG.emailjs.publicKey);
  } catch (_) {
    // safe: init may be no-op if already inited
  }
  const template = templateId || CONFIG.emailjs.templateId;
  const templateParams = {
    to_name: toName || "",
    to_email: toEmail,
    subject,
    message,
  };
  // EmailJS returns a Promise
  const resp = await emailjs.send(CONFIG.emailjs.serviceId, template, templateParams, CONFIG.emailjs.publicKey);
  return resp;
}

/**
 * sendBulkEmail
 *  - recipients: array of {profile_id, client_id, full_name, email, opt_out}
 *  - options: { subject, message, template_id, initiated_by, follow_up_id, refineWithGemini:Boolean }
 */
export async function sendBulkEmail({ recipients = [], subject = "", message = "", template_id = null, initiated_by = null, follow_up_id = null, refineWithGemini = false } = {}) {
  // guard recipients
  recipients = enforceMaxRecipients(recipients || []).filter(r => r && !isOptedOut(r));
  if (recipients.length === 0) throw new Error("No recipients provided.");

  // optional refine step
  let refined = null;
  if (refineWithGemini) {
    try {
      refined = await refineWithGemini({ text: message, tone: "professional" });
      message = refined.refined_text || message;
    } catch (err) {
      // log refine error but continue with original message
      console.warn("Gemini refine failed, continuing with original message", err);
    }
  }

  // cooldown per channel
  const until = COOLDOWN_TRACKER.email || 0;
  if (Date.now() < until) throw new Error(`Email cooldown active. Wait ${Math.ceil((until - Date.now())/1000)}s`);
  COOLDOWN_TRACKER.email = Date.now() + CONFIG.limits.cooldownSeconds * 1000;

  // If edge available, try to delegate full bulk job to Edge (server-side)
  if (CONFIG.edge.baseUrl) {
    const payload = { recipients, subject, message, template_id, initiated_by, follow_up_id, ai_enhanced: !!refined };
    const edgeRes = await callEdge("/send/email", payload);
    if (edgeRes.ok) {
      // Edge handled send + logs; still mirror a local log row for UI
      return { mode: "edge", result: edgeRes.json };
    }
    // else fallback to direct
    console.warn("Edge email send failed, falling back to direct. Reason:", edgeRes.error || edgeRes.json);
  }

  // Direct client-side sending via EmailJS, iterate recipients
  const results = [];
  for (const r of recipients) {
    const rec = r || {};
    const email = rec.email;
    if (!email || !isValidEmail(email)) {
      const payload = {
        client_id: rec.client_id ?? null,
        profile_id: rec.profile_id ?? null,
        channel: "email",
        subject, message,
        provider_response: { error: "invalid_email" },
        status: "failed",
        sent_by: initiated_by ?? null,
        sent_at: nowIso(),
        follow_up_id,
        ai_enhanced: !!refined,
      };
      await dualLog(payload);
      results.push({ recipient: rec, ok: false, error: "invalid_email" });
      continue;
    }

    try {
      const resp = await sendEmailViaEmailJSSingle({
        toEmail: email,
        toName: rec.full_name || "",
        subject,
        message,
        templateId: template_id,
      });
      const payload = {
        client_id: rec.client_id ?? null,
        profile_id: rec.profile_id ?? null,
        channel: "email",
        subject, message,
        provider_response: resp ?? { status: "OK" },
        status: "sent",
        provider_message_id: resp?.id ?? null,
        sent_by: initiated_by ?? null,
        sent_at: nowIso(),
        follow_up_id,
        ai_enhanced: !!refined,
      };
      await dualLog(payload);
      results.push({ recipient: rec, ok: true, resp });
    } catch (err) {
      const payload = {
        client_id: rec.client_id ?? null,
        profile_id: rec.profile_id ?? null,
        channel: "email",
        subject, message,
        provider_response: { error: String(err) },
        status: "failed",
        sent_by: initiated_by ?? null,
        sent_at: nowIso(),
        follow_up_id,
        ai_enhanced: !!refined,
      };
      await dualLog(payload);
      results.push({ recipient: rec, ok: false, error: String(err) });
    }

    // small sleep to avoid client-side rate limits
    await sleep(160);
  }

  return { mode: "direct", results };
}

/*********************
 * Twilio WhatsApp (direct)
 ********************/

/**
 * sendBulkWhatsApp
 *  - recipients: array {profile_id, client_id, phone, full_name, opt_out}
 *  - options: { message, initiated_by, follow_up_id, refineWithGemini:Boolean }
 * Uses Twilio REST API via fetch (Basic Auth) - browser-safe.
 */
// ✅ Direct REST call version (browser safe)
export async function sendWhatsAppDirect(to, message) {
  try {
    const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    const TWILIO_WHATSAPP_FROM = import.meta.env.VITE_TWILIO_WHATSAPP_FROM;

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
        To: `whatsapp:${to}`,
        Body: message,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Twilio send failed");

    console.log("Twilio WhatsApp message sent:", data.sid);
    return { success: true, sid: data.sid, data };
  } catch (err) {
    console.error("Twilio direct send error:", err);
    return { success: false, error: err.message };
  }
}


export async function sendBulkWhatsApp({ recipients = [], message = "", initiated_by = null, follow_up_id = null, refineWithGemini = false } = {}) {
  recipients = enforceMaxRecipients(recipients || []).filter(r => r && !isOptedOut(r));
  if (recipients.length === 0) throw new Error("No recipients provided.");

  // optional refine
  let refined = null;
  if (refineWithGemini) {
    try {
      refined = await refineWithGemini({ text: message, tone: "professional" });
      message = refined.refined_text || message;
    } catch (err) {
      console.warn("Gemini refine failed, continuing: ", err);
    }
  }

  // cooldown
  const until = COOLDOWN_TRACKER.whatsapp || 0;
  if (Date.now() < until) throw new Error(`WhatsApp cooldown active. Wait ${Math.ceil((until - Date.now())/1000)}s`);
  COOLDOWN_TRACKER.whatsapp = Date.now() + CONFIG.limits.cooldownSeconds * 1000;

  // Try Edge delegation first
  if (CONFIG.edge.baseUrl) {
    const payload = { recipients, message, initiated_by, follow_up_id, ai_enhanced: !!refined };
    const edgeRes = await callEdge("/send/whatsapp", payload);
    if (edgeRes.ok) {
      return { mode: "edge", result: edgeRes.json };
    }
    console.warn("Edge whatsapp send failed, falling back to direct:", edgeRes.error || edgeRes.json);
  }

  // Direct Twilio REST call per recipient
  const results = [];
  const twilioSid = CONFIG.twilio.sid;
  const twilioToken = CONFIG.twilio.token;
  const twilioFrom = CONFIG.twilio.from;
  if (!twilioSid || !twilioToken || !twilioFrom) {
    throw new Error("Twilio not configured in environment variables.");
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;

  for (const rec of recipients) {
    const phone = cleanPhone(rec.phone || rec.mobile || rec.phone_number);
    if (!phone) {
      const payload = {
        client_id: rec.client_id ?? null,
        profile_id: rec.profile_id ?? null,
        channel: "whatsapp",
        message,
        provider_response: { error: "invalid_phone" },
        status: "failed",
        sent_by: initiated_by ?? null,
        sent_at: nowIso(),
        follow_up_id,
        ai_enhanced: !!refined,
      };
      await dualLog(payload);
      results.push({ recipient: rec, ok: false, error: "invalid_phone" });
      continue;
    }
    const params = new URLSearchParams();
    params.append("From", `whatsapp:${twilioFrom}`);
    params.append("To", `whatsapp:${phone}`);
    params.append("Body", message);

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: "Basic " + b64Auth(twilioSid, twilioToken),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
      const json = await resp.json();
      if (!resp.ok) {
        await dualLog({
          client_id: rec.client_id ?? null,
          profile_id: rec.profile_id ?? null,
          channel: "whatsapp",
          message,
          provider_response: json,
          status: "failed",
          provider_message_id: json?.sid ?? null,
          sent_by: initiated_by ?? null,
          sent_at: nowIso(),
          follow_up_id,
          ai_enhanced: !!refined,
        });
        results.push({ recipient: rec, ok: false, error: json });
      } else {
        await dualLog({
          client_id: rec.client_id ?? null,
          profile_id: rec.profile_id ?? null,
          channel: "whatsapp",
          message,
          provider_response: json,
          status: "sent",
          provider_message_id: json?.sid ?? null,
          sent_by: initiated_by ?? null,
          sent_at: nowIso(),
          follow_up_id,
          ai_enhanced: !!refined,
        });
        results.push({ recipient: rec, ok: true, json });
      }
    } catch (err) {
      await dualLog({
        client_id: rec.client_id ?? null,
        profile_id: rec.profile_id ?? null,
        channel: "whatsapp",
        message,
        provider_response: { error: String(err) },
        status: "failed",
        sent_by: initiated_by ?? null,
        sent_at: nowIso(),
        follow_up_id,
        ai_enhanced: !!refined,
      });
      results.push({ recipient: rec, ok: false, error: String(err) });
    }

    await sleep(220); // slight throttle
  }

  return { mode: "direct", results };
}

/*********************
 * Retry helper (client requests server-side retry via Edge)
 *********************/
export async function retryCommunication({ communication_log_id } = {}) {
  if (!communication_log_id) throw new Error("communication_log_id required");
  if (!CONFIG.edge.baseUrl) throw new Error("Edge base URL not configured for retry");
  const res = await callEdge("/retries/retry", { communication_log_id });
  if (!res.ok) throw new Error(res.error || res.json || "Edge retry failed");
  return res.json;
}

/*********************
 * Follow-up bulk creator
 *
 * createBulkFollowUps({ recipients, followupData, created_by })
 *  - recipients: array of recipient objects (profile_id required)
 *  - followupData: { title, notes, due_at (ISO string/date), priority, notify_channels }
 *  - created_by: profile id of the user creating the follow-ups
 *********************/
export async function createBulkFollowUps({ recipients = [], followupData = {}, created_by = null } = {}) {
  if (!Array.isArray(recipients) || recipients.length === 0) throw new Error("No recipients provided for follow-ups");
  // require profile_id for each recipient (per your requirement)
  const missing = recipients.filter(r => !r.profile_id);
  if (missing.length > 0) throw new Error("One or more recipients missing profile_id; follow-ups must be linked to profile_id");

  // build insert rows
  const rows = recipients.map((r) => {
    const dueAt = followupData.due_at ? new Date(followupData.due_at).toISOString() : new Date().toISOString();
    return {
      profile_id: r.profile_id,
      client_id: r.client_id ?? null,
      title: followupData.title || "Follow-up",
      notes: followupData.notes || "",
      due_at: dueAt,
      recurrence: followupData.recurrence ?? null,
      priority: followupData.priority || "normal",
      status: "pending",
      assigned_to: followupData.assigned_to ?? null,
      notify_channels: followupData.notify_channels ?? ['email','whatsapp'],
      created_by: created_by ?? null,
      created_at: nowIso(),
    };
  });

  try {
    const { data, error } = await supabase.from("follow_ups").insert(rows).select();
    if (error) throw error;
    // Optionally write follow_up_logs for each
    const logs = data.map((row) => ({
      follow_up_id: row.id,
      action: "created_bulk",
      actor_profile_id: created_by ?? null,
      message: `Bulk follow-up created for profile ${row.profile_id}`,
      created_at: nowIso(),
    }));
    await supabase.from("follow_up_logs").insert(logs);
    return { ok: true, rows: data };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/*********************
 * Utility: ensureSelection for UI
 *
 * The UI should call ensureSelection(recipients) before calling send functions.
 * This helper throws if nothing selected.
 *********************/
export function ensureSelection(recipients) {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error("Select at least one client/profile before performing this action.");
  }
  // also filter opt-outs centrally
  return recipients.filter(r => !isOptedOut(r));
}

/*********************
 * Expose and export
 *********************/
const DirectCommunicationService = {
  // Edge health
  checkEdgeHealth,

  // Gemini
  refineWithGemini,

  // Email
  sendBulkEmail,

  // WhatsApp
  sendBulkWhatsApp,

  // Retry
  retryCommunication,

  // Follow-ups
  createBulkFollowUps,

  // Helpers
  ensureSelection,
  dualLog, // exported in case UI wants to create custom logs
};

export default DirectCommunicationService;
export { sendBulkEmail as sendBulkEmailDirect };
export { sendBulkWhatsApp as sendBulkWhatsAppDirect }; 
export {checkEdgeHealth };