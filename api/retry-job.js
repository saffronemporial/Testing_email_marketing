// api/retry-job.js
// POST { job_id }
// Protected by AUTOMATION_SECRET (same as process-automation recommended).
// Moves job back to 'pending' and resets attempts (or increments as configured).

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AUTOMATION_SECRET = process.env.AUTOMATION_SECRET || null;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (AUTOMATION_SECRET) {
      const provided = req.headers['x-automation-secret'] || req.body?.automation_secret;
      if (!provided || provided !== AUTOMATION_SECRET) {
        return res.status(401).json({ error: 'Unauthorized (automation secret missing or invalid)' });
      }
    }

    const { job_id } = req.body || {};
    if (!job_id) return res.status(400).json({ error: 'job_id required' });

    // Reset status to pending and zero attempts
    const { data, error } = await supabase.from('automation_queue').update({
      status: 'pending',
      attempts: 0,
      next_run: new Date().toISOString(),
      last_error: null,
      updated_at: new Date().toISOString()
    }).eq('id', job_id);

    if (error) {
      console.error('retry-job supabase error', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true, job: data?.[0] || null });
  } catch (err) {
    console.error('retry-job error', err);
    return res.status(500).json({ error: String(err) });
  }
}
