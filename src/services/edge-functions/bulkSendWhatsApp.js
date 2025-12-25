// bulkSendWhatsApp.js - Node (Supabase Edge Function / Vercel serverless)
// Uses Twilio to send WhatsApp messages and writes logs to Supabase via service-role key.
// Required env:
// - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
// - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import Twilio from 'twilio';
import fetch from 'node-fetch';

const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

async function insertLog(supabaseAuthHeader, payload) {
  // insert into communication_logs via REST
  await fetch(`${SUPABASE_URL}/rest/v1/communication_logs`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...supabaseAuthHeader
    },
    body: JSON.stringify(payload)
  });
}

export default async function handler(req, res) {
  try {
    const body = await req.json();
    const { filter, message, template_id, initiated_by } = body;
    // Validate input, check sender authorization (you should check JWT)
    // Query Supabase to get recipients matching filter (server-side)
    const recipientsResp = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,phone,email,opt_out&${/* add filters */ ''}`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    const recipients = await recipientsResp.json();
    // Filter out opt_outs and invalid phones
    const toSend = recipients
      .filter(r => !r.opt_out && r.phone)
      .map(r => ({ profile_id: r.id, phone: r.phone }));

    // Cap recipients per job
    const MAX_RECIPIENTS = 1000;
    if (toSend.length > MAX_RECIPIENTS) {
      return new Response(JSON.stringify({ error: 'Recipient count exceeds limit', count: toSend.length }), { status: 400 });
    }

    // Chunk and send with concurrency limit
    const CHUNK_SIZE = 50; // adjust for Twilio rate
    for (let i=0; i < toSend.length; i += CHUNK_SIZE) {
      const chunk = toSend.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(async r => {
        try {
          const sendResp = await client.messages.create({
            body: message,
            from: TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${r.phone}`
          });
          // log success
          await insertLog(null, {
            profile_id: r.profile_id,
            channel: 'whatsapp',
            message: message,
            provider_response: { sid: sendResp.sid },
            status: 'sent',
            sent_by: initiated_by,
            sent_at: new Date().toISOString()
          });
        } catch (err) {
          // log failure
          await insertLog(null, {
            profile_id: r.profile_id,
            channel: 'whatsapp',
            message: message,
            provider_response: { error: err.message },
            status: 'failed',
            sent_by: initiated_by,
            sent_at: new Date().toISOString()
          });
        }
      }));
      // small delay between chunks for rate limiting if needed
      await new Promise(r => setTimeout(r, 1000)); // 1 second pause
    }

    return new Response(JSON.stringify({ status: 'ok', sent: toSend.length }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
