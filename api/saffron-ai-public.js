// api/saffron-ai-public.js
// Vercel serverless function: public AI endpoint for Landing Page.
// Uses Google Gemini via REST. Keep GEMINI_API_KEY in Vercel env, never in frontend.

export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY missing from environment variables');
      return res.status(500).json({ 
        error: 'AI service temporarily unavailable',
        detail: 'Configuration error'
      });
    }

    const { question } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Valid question is required' });
    }

    if (question.length > 1200) {
      return res.status(400).json({ 
        error: 'Question too long. Please keep it under 1200 characters.' 
      });
    }

    const systemPrompt = `You are "Saffron AI", the public-facing assistant for Saffron Emporial, 
an Indian export company supplying pomegranates, onions, grapes, banana, chilly, cumin, 
green coconuts, granite & marbles, tiles, kids electric toys and other agro / allied products 
to global markets (especially Gulf countries).

Rules:
- Answer in a professional, export-focused tone.
- Focus on logistics, quality standards, documentation, packing, and trade questions.
- Do NOT promise prices or legal guarantees.
- If user asks something unrelated to trade, politely bring them back to export topics.
- Keep answers concise but informative (3-5 paragraphs maximum).
- Include relevant details about certifications, shipping methods, or quality standards when applicable.
- If you don't know something specific, suggest contacting the company directly.
`;

    // Updated Gemini API endpoint (using the latest stable version)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\nUser Question:\n${question}\n\nProvide a helpful, professional response:`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log('Calling Gemini API...');
    const aiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      console.error('Gemini API Error:', {
        status: aiRes.status,
        statusText: aiRes.statusText,
        error: errorText
      });
      
      // Return more specific error based on status
      if (aiRes.status === 400) {
        return res.status(400).json({ 
          error: 'Invalid request to AI service',
          detail: 'Please check your question format'
        });
      } else if (aiRes.status === 401 || aiRes.status === 403) {
        return res.status(500).json({ 
          error: 'AI service authentication failed',
          detail: 'Please try again later'
        });
      } else if (aiRes.status === 429) {
        return res.status(429).json({ 
          error: 'AI service rate limit reached',
          detail: 'Please try again in a few moments'
        });
      }
      
      return res.status(502).json({ 
        error: 'AI service is temporarily unavailable',
        detail: 'Please try again in a few minutes'
      });
    }

    const data = await aiRes.json();
    
    // Extract response text safely
    let answer = 'No answer generated. Please try again.';
    try {
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        answer = data.candidates[0].content.parts
          ?.map((p) => p.text || '')
          .join('\n')
          .trim();
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
    }

    // Ensure we have a valid answer
    if (!answer || answer.length < 10) {
      answer = "I apologize, but I couldn't generate a proper response. Please rephrase your question or try again.";
    }

    console.log('Successfully generated response');
    return res.status(200).json({ 
      answer,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('Saffron AI fatal error:', err);
    return res.status(500).json({ 
      error: 'Internal server error',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
