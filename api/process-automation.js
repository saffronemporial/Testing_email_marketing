// api/process-automation.js
// POST triggers processing of pending automation jobs (safe for scheduled runs via Vercel Cron)
// Body optional: { limit: 10 }
// This endpoint should be protected (set a secret header or use Vercel Team deploy rules).
// It will fetch 'pending' jobs, try to lock them, then process simple actions (email/whatsapp).

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import Twilio from 'twilio';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role required for writes
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('process-automation: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
const twilioClient = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN ? Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

async function sendEmailViaEmailJS({ to, subject, template_params }) {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) throw new Error('EmailJS not configured');
  const payload = {
    service_id: EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id: EMAILJS_PUBLIC_KEY,
    template_params: { ...template_params, to_email: Array.isArray(to) ? to.join(',') : to, subject }
  };
  const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(`EmailJS error ${r.status} ${await r.text()}`);
  return { provider: 'emailjs' };
}

async function sendWhatsApp({ to, body }) {
  if (!twilioClient) throw new Error('Twilio not configured');
  const toNormalized = String(to).startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const msg = await twilioClient.messages.create({ from: TWILIO_WHATSAPP_FROM, to: toNormalized, body });
  return { provider: 'twilio', sid: msg.sid };
}

export default async function handler(req, res) {
  // optional: require a secret header to protect endpoint
  const secret = req.headers['x-automation-secret'];
  if (process.env.AUTOMATION_SECRET && secret !== process.env.AUTOMATION_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const limit = Number(req.body?.limit || 10);

  try {
    // 1) Fetch pending jobs
    const { data: jobs, error: fetchErr } = await supabase
      .from('automation_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('next_run', new Date().toISOString())
      .order('next_run', { ascending: true })
      .limit(limit);

    if (fetchErr) throw fetchErr;
    if (!jobs || jobs.length === 0) return res.status(200).json({ processed: 0 });

    let processed = 0;
    for (const job of jobs) {
      // Attempt to lock (atomic update where status=pending)
      const { data: lockData, error: lockErr } = await supabase
        .from('automation_queue')
        .update({ status: 'processing', updated_at: new Date().toISOString() }, { returning: 'representation' })
        .eq('id', job.id)
        .eq('status', 'pending');

      if (lockErr) {
        console.warn('lock error', lockErr);
        continue; // skip
      }
      if (!lockData || lockData.length === 0) continue; // someone else took it

      const lockedJob = lockData[0];

      try {
        const payload = lockedJob.payload || {};
        const action = payload.action || lockedJob.event_type;

        if (action === 'send_email' || action === 'email') {
          await sendEmailViaEmailJS({ to: payload.to, subject: payload.subject, template_params: payload.template_params || { body: payload.body } });
        } else if (action === 'send_whatsapp' || action === 'whatsapp') {
          await sendWhatsApp({ to: payload.to, body: payload.body || payload.message });
        } else {
          // unsupported: mark failed
          await supabase.from('automation_queue').update({
            status: 'failed',
            last_error: `unsupported action ${action}`,
            updated_at: new Date().toISOString()
          }).eq('id', lockedJob.id);
          continue;
        }

        // mark success
        await supabase.from('automation_queue').update({
          status: 'sent',
          attempts: (lockedJob.attempts || 0),
          last_error: null,
          updated_at: new Date().toISOString(),
          next_run: null
        }).eq('id', lockedJob.id);

        // log
        await supabase.from('communication_logs').insert([{
          client_id: payload.client_id || null,
          profile_id: payload.profile_id || null,
          channel: payload.action || action,
          subject: payload.subject || null,
          message: JSON.stringify(payload.body || payload.message || payload.template_params || payload),
          provider_response: { ok: true },
          status: 'sent',
          sent_by: payload.sent_by || null,
          sent_at: new Date().toISOString()
        }]);

        processed++;
      } catch (errInner) {
        console.error('processing job failed', job.id, errInner);
        // set attempts + backoff
        const attempts = (job.attempts || 0) + 1;
        const nextRun = attempts >= (Number(process.env.AUTOMATOR_MAX_ATTEMPTS || 5)) ? null : new Date(Date.now() + Math.pow(attempts,2)*30000).toISOString();
        await supabase.from('automation_queue').update({
          status: attempts >= (Number(process.env.AUTOMATOR_MAX_ATTEMPTS || 5)) ? 'failed' : 'pending',
          attempts,
          last_error: String(errInner).slice(0,1000),
          next_run: nextRun,
          updated_at: new Date().toISOString()
        }).eq('id', job.id);
      }
    }

    return res.status(200).json({ processed });
  } catch (err) {
    console.error('process-automation error', err);
    return res.status(500).json({ error: String(err) });
  }
}
