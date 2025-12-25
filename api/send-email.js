// api/send-email.js
// Vercel serverless: POST JSON { to, subject, template_params }
// Uses EmailJS REST API (server-side) so your client does not call it directly.

import fetch from 'node-fetch';

const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const to = body.to;
    const subject = body.subject || '';
    const template_params = body.template_params || { body: body.body || '' };

    if (!to) return res.status(400).json({ error: 'Missing "to" in request body' });
    if (!EMAILJS_USER_ID || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
      return res.status(500).json({ error: 'EmailJS env not configured' });
    }

    const payload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        ...template_params,
        to_email: Array.isArray(to) ? to.join(',') : to,
        subject
      }
    };

    const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    if (!r.ok) {
      return res.status(r.status || 500).json({ ok: false, detail: text });
    }

    return res.status(200).json({ ok: true, provider: 'emailjs', response: text });
  } catch (err) {
    console.error('send-email error', err);
    return res.status(500).json({ error: String(err) });
  }
}
