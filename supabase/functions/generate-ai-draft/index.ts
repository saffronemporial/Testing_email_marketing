import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, template_id, tone = 'professional', length = 'medium' } = requestBody;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get environment variables with validation
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ 
          error: "AI service not configured",
          details: "Please set up Gemini API key in environment variables" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Load template if provided
    let template = null;
    if (template_id) {
      const { data, error: templateError } = await supabase
        .from("email_templates")
        .select("*")
        .eq("id", template_id)
        .single();
      
      if (templateError) {
        console.error("Template error:", templateError);
        // Continue without template if it doesn't exist
      } else {
        template = data;
      }
    }

    // Generate content using Gemini
    const aiContent = await generateWithGemini({
      prompt,
      template,
      tone,
      length,
      apiKey: geminiApiKey
    });

    // Generate approval token
    const approvalToken = crypto.randomUUID();

    // Save as draft
    const { data: draft, error: draftError } = await supabase
      .from("ai_email_drafts")
      .insert({
        template_id: template_id,
        generated_subject: aiContent.subject,
        generated_html: aiContent.html,
        generated_text: aiContent.text,
        generated_by: "manual",
        status: "generated",
        approval_token: approvalToken,
        user_prompt: prompt,
        tone: tone,
        length: length
      })
      .select()
      .single();

    if (draftError) {
      console.error("Database error:", draftError);
      throw new Error(`Failed to save draft: ${draftError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        draft: {
          id: draft.id,
          subject: draft.generated_subject,
          html: draft.generated_html,
          text: draft.generated_text,
          approval_token: draft.approval_token
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate AI draft error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate AI draft",
        details: error.message,
        type: error.name
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface GeminiParams {
  prompt: string;
  template: any;
  tone: string;
  length: string;
  apiKey: string;
}

async function generateWithGemini({ prompt, template, tone, length, apiKey }: GeminiParams) {
  const toneInstructions: Record<string, string> = {
    professional: "Use professional, business-appropriate language.",
    friendly: "Use warm, approachable, conversational language.",
    urgent: "Create a sense of urgency and importance.",
    persuasive: "Focus on benefits, value propositions, and include clear CTAs."
  };

  const lengthInstructions: Record<string, string> = {
    short: "Keep under 100 words. Be concise and to the point.",
    medium: "Aim for 150-300 words. Provide good detail but stay focused.",
    long: "Aim for 400-600 words. Provide comprehensive information with examples."
  };

  const systemPrompt = `You are an expert email copywriter for "Saffron Emporial", an export company specializing in premium goods including saffron, dry fruits, and spices.

IMPORTANT: Return your response in this EXACT format:
SUBJECT: [Your subject line here]
HTML: [Your HTML email content here]
TEXT: [Your plain text version here]

Guidelines:
- Tone: ${toneInstructions[tone] || toneInstructions.professional}
- Length: ${lengthInstructions[length] || lengthInstructions.medium}
- Include a professional signature
- Make it engaging and value-driven
${template ? `- Template Context: ${template.base_prompt}` : ''}
- Brand voice: Premium, trustworthy, quality-focused
- Always include an unsubscribe mention in both HTML and text versions

User Request: ${prompt}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (!generatedText) {
      throw new Error("No content generated by AI");
    }

    // Parse the structured response
    let subject = "Saffron Emporial - Premium Export Services";
    let html = "";
    let text = "";

    const subjectMatch = generatedText.match(/SUBJECT:\s*(.+?)(?=\nHTML:|$)/i);
    const htmlMatch = generatedText.match(/HTML:\s*(.+?)(?=\nTEXT:|$)/is);
    const textMatch = generatedText.match(/TEXT:\s*(.+?)$/is);

    if (subjectMatch) {
      subject = subjectMatch[1].trim();
    }

    if (htmlMatch) {
      html = htmlMatch[1].trim();
    } else {
      // Fallback: use everything that's not marked as TEXT
      const parts = generatedText.split('TEXT:');
      html = parts[0].replace(/SUBJECT:.+?\n?/i, '').trim();
    }

    if (textMatch) {
      text = textMatch[1].trim();
    } else if (html) {
      // Create text version from HTML if not provided
      text = html.replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Add unsubscribe link
    const unsubscribeHtml = `<p style="font-size: 12px; color: #666; margin-top: 20px;">
      <a href="{{unsubscribe_link}}">Unsubscribe</a> from these emails
    </p>`;
    
    const unsubscribeText = `\n\nUnsubscribe: {{unsubscribe_link}}`;

    html += unsubscribeHtml;
    text += unsubscribeText;

    // Wrap in template if provided
    if (template?.html_wrapper) {
      html = template.html_wrapper.replace("{{content}}", html);
    }

    return {
      subject,
      html,
      text
    };

  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
}