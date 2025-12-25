// api/send-email-preview.js
// POST { template_id?, content?, template_params? }
// If template_id is provided, fetch content from communication_templates table (content column).
// Responds with HTML (Content-Type: text/html) so you can open preview in new tab.

import { createClient } from '@supabase/supabase-js';
import Handlebars from 'handlebars';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PREVIEW_SECRET = process.env.PREVIEW_SECRET || null;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // optional security check: require x-preview-secret if PREVIEW_SECRET set
    if (PREVIEW_SECRET) {
      const provided = req.headers['x-preview-secret'] || req.body?.preview_secret;
      if (!provided || provided !== PREVIEW_SECRET) {
        return res.status(401).json({ error: 'Unauthorized (preview secret missing or invalid)' });
      }
    }

    const { template_id, content, template_params = {} } = req.body || {};
    let templateHtml = '';

    if (template_id) {
      // fetch template from comm_templates
      const { data, error } = await supabase
        .from('communication_templates')
        .select('content, subject, name')
        .eq('id', template_id)
        .limit(1)
        .single();

      if (error) {
        return res.status(400).json({ error: 'Template not found', detail: error.message });
      }
      templateHtml = data.content || '';
    } else if (content) {
      templateHtml = content;
    } else {
      return res.status(400).json({ error: 'Need template_id or content' });
    }

    // Basic safety: ensure templateHtml is string
    if (typeof templateHtml !== 'string') templateHtml = String(templateHtml || '');

    // Compile with Handlebars
    const template = Handlebars.compile(templateHtml, { noEscape: false });
    const compiled = template(template_params);

    // Optional: wrap in a minimal preview frame (header + footer) for consistent preview
    const previewHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>Email Preview</title>
          <style>
            body { margin:0; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial; background:#f6f9fc; padding:20px;}
            .preview { max-width: 800px; margin: 0 auto; box-shadow: 0 6px 24px rgba(0,0,0,0.08); border-radius:8px; overflow:hidden; background:#fff;}
            .preview-header { padding:16px 20px; background:linear-gradient(90deg,#F4A460,#FFD700); color:#fff; font-weight:700;}
            .preview-body { padding:20px; }
            .preview-footer { padding:12px 20px; font-size:12px; color:#666; background:#fbfbfb; border-top:1px solid #eee;}
          </style>
        </head>
        <body>
          <div class="preview" role="main">
            <div class="preview-header">Saffron Emporial — Email Preview</div>
            <div class="preview-body">${compiled}</div>
            <div class="preview-footer">Preview generated at ${new Date().toISOString()}</div>
          </div>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(previewHtml);
  } catch (err) {
    console.error('send-email-preview error', err);
    return res.status(500).json({ error: String(err) });
  }
}
