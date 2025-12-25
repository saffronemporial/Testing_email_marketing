// api/send-whatsapp.js
// POST JSON { to, body }
// Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM

import Twilio from 'twilio';

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM; // e.g., 'whatsapp:+1415...'

let client = null;
if (ACCOUNT_SID && AUTH_TOKEN) client = Twilio(ACCOUNT_SID, AUTH_TOKEN);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!client) return res.status(500).json({ error: 'Twilio credentials not configured' });

    const { to, body: messageBody } = req.body || {};
    if (!to || !messageBody) return res.status(400).json({ error: 'Missing "to" or "body"' });
    if (!WHATSAPP_FROM) return res.status(500).json({ error: 'TWILIO_WHATSAPP_FROM not configured' });

    const toNormalized = String(to).startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const msg = await client.messages.create({
      from: WHATSAPP_FROM,
      to: toNormalized,
      body: messageBody
    });

    return res.status(200).json({ ok: true, sid: msg.sid, raw: msg });
  } catch (err) {
    console.error('send-whatsapp error', err);
    // Twilio returns structured error; forward message where helpful
    return res.status(500).json({ error: err.message || String(err), raw: err });
  }
}
