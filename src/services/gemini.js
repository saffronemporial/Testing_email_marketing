// server/src/routes/gemini.js
import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // Node v18+ already has fetch; if using older node, install node-fetch
dotenv.config();

const router = express.Router();
const SERVER_API_KEY = process.env.SERVER_API_KEY || '';
const GEMINI_BASE = process.env.GEMINI_BASE_URL || 'http://www.saffronemporial.com'; 'http://localhost3000' ;

function requireServerKey(req, res, next) {
  const key = req.header('x-server-key') || req.query.server_key;
  if (!SERVER_API_KEY) return res.status(500).json({ error: 'Server key not configured on server' });
  if (!key || key !== SERVER_API_KEY) return res.status(401).json({ error: 'Unauthorized - missing or invalid server key' });
  next();
}

router.get('/health', requireServerKey, async (req, res) => {
  try {
    const r = await fetch(`${GEMINI_BASE.replace(/\/$/, '')}/health`);
    const json = await r.json();
    res.json({ ok: true, remote: json });
  } catch (err) {
    console.warn('[gemini] health ping failed', err?.message || err);
    res.status(500).json({ error: String(err?.message || err) });
  }
});

// POST /gemini/refine
// body { prompt: "...", options: { ... } }
router.post('/refine', requireServerKey, async (req, res) => {
  try {
    const { prompt, options } = req.body;
    if (!prompt) return res.status(400).json({ error: 'missing prompt' });

    const r = await fetch(`${GEMINI_BASE.replace(/\/$/, '')}/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, options })
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(500).json({ error: `Gemini remote failed ${r.status}: ${text}` });
    }

    const json = await r.json();
    res.json({ ok: true, data: json });
  } catch (err) {
    console.error('[gemini] refine error', err?.message || err);
    res.status(500).json({ error: String(err?.message || err) });
  }
});

export default router;
