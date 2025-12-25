// api/ask-saffron-ai.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { prompt, context } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ ok: false, error: 'Prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model =
      process.env.GEMINI_MODEL || 'gemini-1.5-flash'; // you can change in env
    if (!apiKey) {
      console.error('GEMINI_API_KEY not set');
      return res.status(500).json({ ok: false, error: 'AI not configured.' });
    }

    const apiUrl =
      process.env.GEMINI_API_URL ||
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text:
                (context
                  ? `You are Saffron Emporial's export assistant. Use this context: ${context}\n\n`
                  : 'You are Saffron Emporial’s export assistant.\n\n') + prompt,
            },
          ],
        },
      ],
    };

    const geminiResp = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!geminiResp.ok) {
      const text = await geminiResp.text();
      console.error('Gemini API error:', geminiResp.status, text);
      return res.status(502).json({
        ok: false,
        error: 'AI service error. Please try again.',
        details: text,
      });
    }

    const data = await geminiResp.json();

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response right now.';

    return res.status(200).json({ ok: true, answer });
  } catch (err) {
    console.error('ask-saffron-ai handler error:', err);
    return res.status(500).json({
      ok: false,
      error: 'Unexpected server error while calling AI.',
    });
  }
}
