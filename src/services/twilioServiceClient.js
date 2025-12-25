import { Twilio } from "twilio";

// src/services/twilioServiceClient.js
const PROXY_BASE = import.meta.env.VITE_TWILIO_PROXY_URL; // e.g. https://twilio-proxy.yourdomain.com

if (!PROXY_BASE) {
  console.warn('[twilioServiceClient] VITE_TWILIO_PROXY_URL not configured - WhatsApp/SMS will not work');
}

export async function sendWhatsAppViaProxy(toPhone, body) {
  if (!PROXY_BASE) throw new Error('Twilio proxy not configured');
  const res = await fetch(`${PROXY_BASE.replace(/\/$/, '')}/send-whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: toPhone, body })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxy WhatsApp error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function sendSmsViaProxy(toPhone, body) {
  if (!PROXY_BASE) throw new Error('Twilio proxy not configured');
  const res = await fetch(`${PROXY_BASE.replace(/\/$/, '')}/send-sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: toPhone, body })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxy SMS error ${res.status}: ${text}`);
  }
  return res.json();
}
