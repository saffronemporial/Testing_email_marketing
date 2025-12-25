import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { campaign_id, template_id, tone = "formal" } = await req.json();

    if (!campaign_id || !template_id) {
      return new Response(
        JSON.stringify({ error: "campaign_id and template_id required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    /* -------------------------------------------------------
       LOAD TEMPLATE
    -------------------------------------------------------- */
    const { data: template, error: tplErr } = await supabase
      .from("email_templates")
      .select("blocks, name")
      .eq("id", template_id)
      .single();

    if (tplErr || !template?.blocks) {
      throw new Error("Template not found or empty");
    }

    /* -------------------------------------------------------
       LOAD VARIABLES
    -------------------------------------------------------- */
    const { data: variables } = await supabase
      .from("template_variables")
      .select("key, type, required, default_value, ai_hint")
      .eq("template_id", template_id);

    /* -------------------------------------------------------
       BUILD AI PROMPT
    -------------------------------------------------------- */
    const variableContext = (variables || [])
      .map(
        (v) =>
          `{{${v.key}}} (${v.type}) ${
            v.required ? "[required]" : ""
          } - ${v.ai_hint || ""}`
      )
      .join("\n");

    const blockText = JSON.stringify(template.blocks, null, 2);

    const prompt = `
You are an expert B2B export marketing copywriter.

Tone: ${tone}

Variables:
${variableContext}

Template blocks (JSON):
${blockText}

Instructions:
- Improve clarity and professionalism
- Do NOT invent facts
- Keep structure identical
- Replace only text values
- Return JSON with:
  {
    "subject": "...",
    "blocks": [...]
  }
`;

    /* -------------------------------------------------------
       CALL GEMINI
    -------------------------------------------------------- */
    const aiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        Deno.env.get("GEMINI_API_KEY"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!aiRes.ok) {
      throw new Error("AI generation failed");
    }

    const aiJson = await aiRes.json();
    const text = aiJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("AI response empty");
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("AI returned invalid JSON");
    }

    /* -------------------------------------------------------
       SAVE DRAFT
    -------------------------------------------------------- */
    await supabase
      .from("email_campaigns")
      .update({
        subject: parsed.subject,
        draft_blocks: parsed.blocks,
        status: "draft_ready",
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaign_id);

    return new Response(
      JSON.stringify({
        status: "draft_generated",
        subject: parsed.subject,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("generate-email-draft error:", err);

    /* -------------------------------------------------------
       LOG ERROR
    -------------------------------------------------------- */
    await supabase.from("system_error_logs").insert({
      severity: "critical",
      source: "generate-email-draft",
      message: String(err),
      payload: null,
    });

    return new Response(
      JSON.stringify({ error: "Failed to generate email draft" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
