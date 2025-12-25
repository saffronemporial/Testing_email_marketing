// api/export-csv.js
// GET or POST → returns CSV attachment of communication_logs (server-side).
// Query params: from, to, channel, status, limit
// Protected by EXPORT_SECRET if set.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EXPORT_SECRET = process.env.EXPORT_SECRET || null;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

function toCSV(rows = []) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const s = String(val);
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const header = cols.join(',');
  const body = rows.map(r => cols.map(c => escape(r[c])).join(',')).join('\n');
  return header + '\n' + body;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (EXPORT_SECRET) {
      const provided = req.headers['x-export-secret'] || (req.body && req.body.export_secret);
      if (!provided || provided !== EXPORT_SECRET) {
        return res.status(401).json({ error: 'Unauthorized (export secret missing or invalid)' });
      }
    }

    const q = req.method === 'GET' ? req.query : req.body || {};
    const { from, to, channel, status, limit = 1000 } = q;

    let qb = supabase.from('communication_logs').select('id, client_id, profile_id, channel, template_id, subject, message, status, provider_response, created_at, sent_at').order('created_at', { ascending: false }).limit(Math.min(limit, 50000));

    if (from) qb = qb.gte('created_at', from);
    if (to) qb = qb.lte('created_at', to);
    if (channel) qb = qb.eq('channel', channel);
    if (status) qb = qb.eq('status', status);

    const { data, error } = await qb;

    if (error) {
      console.error('export-csv supabase error', error);
      return res.status(500).json({ error: error.message });
    }

    const rows = (data || []).map(r => ({
      id: r.id,
      client_id: r.client_id || '',
      profile_id: r.profile_id || '',
      channel: r.channel || '',
      template_id: r.template_id || '',
      subject: r.subject || '',
      message: typeof r.message === 'object' ? JSON.stringify(r.message) : (r.message || ''),
      provider_response: r.provider_response ? JSON.stringify(r.provider_response) : '',
      status: r.status || '',
      created_at: r.created_at || '',
      sent_at: r.sent_at || ''
    }));

    const csv = toCSV(rows);
    const filename = `communication_logs_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'_')}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error('export-csv error', err);
    return res.status(500).json({ error: String(err) });
  }
}
