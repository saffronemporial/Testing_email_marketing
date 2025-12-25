// api/ping-edge.js
// GET → checks Supabase health endpoint server-side (so the browser doesn't hit Supabase directly and face CORS)

import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ ok: false, message: 'Supabase not configured' });
  }

  try {
    const healthUrl = `${SUPABASE_URL.replace(/\/$/, '')}/health`;
    const r = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    // return status + body
    const text = await r.text();
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, status: r.status, body: text });
  } catch (err) {
    console.error('ping-edge error', err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
