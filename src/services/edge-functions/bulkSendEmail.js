// bulkSendEmail.js - Node (Supabase Edge Function / Vercel)
// Option: call EmailJS REST or a server-side SMTP provider (SendGrid recommended for server-side).
// If you prefer EmailJS client-side only flows, adapt. Here we assume server-side send via SMTP or SendGrid.

import fetch from 'node-fetch';
import nodemailer from 'nodemailer'; // install nodemailer if using SMTP

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Example with nodemailer + Gmail app password (or better: use SendGrid / Mailgun)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_SMTP_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function insertLog(payload) {
  await fetch(`${SUPABASE_URL}/rest/v1/communication_logs`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export default async function handler(req, res) {
  try {
    const { filter, subject, htmlContent, textContent, initiated_by } = await req.json();
    // Query recipients from Supabase
    // ... perform safe filtering
    const recipientsResp = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,email,opt_out&${/* filters */ ''}`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    const recipients = await recipientsResp.json();

    const toSend = recipients.filter(r => !r.opt_out && r.email);
    const MAX_RECIPIENTS = 1000;
    if (toSend.length > MAX_RECIPIENTS) {
      return new Response(JSON.stringify({ error: 'Recipient count exceeds limit', count: toSend.length }), { status: 400 });
    }

    const CHUNK_SIZE = 100;
    for (let i=0; i < toSend.length; i += CHUNK_SIZE) {
      const chunk = toSend.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(async r => {
        try {
          // Personalize content if needed
          await transporter.sendMail({
            from: process.env.GMAIL_SMTP_USER,
            to: r.email,
            subject: subject,
            text: textContent,
            html: htmlContent
          });
          await insertLog({
            profile_id: r.id,
            channel: 'email',
            subject,
            message: textContent,
            provider_response: { info: 'sent' },
            status: 'sent',
            sent_by: initiated_by,
            sent_at: new Date().toISOString()
          });
        } catch (err) {
          await insertLog({
            profile_id: r.id,
            channel: 'email',
            subject,
            message: textContent,
            provider_response: { error: err.message },
            status: 'failed',
            sent_by: initiated_by,
            sent_at: new Date().toISOString()
          });
        }
      }));
      await new Promise(r => setTimeout(r, 500)); // pause
    }

    return new Response(JSON.stringify({ status: 'ok', sent: toSend.length }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
