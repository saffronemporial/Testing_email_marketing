import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Load weekly template
    const { data: template } = await supabase
      .from("email_templates")
      .select("*")
      .eq("category", "weekly")
      .limit(1)
      .single();

    if (!template) throw new Error("Weekly template not found");

    // 2. Generate content using Gemini
    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: template.base_prompt }],
            },
          ],
        }),
      }
    );

    const aiJson = await aiRes.json();
    const text = aiJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("AI returned empty response");

    const approvalToken = crypto.randomUUID();

    // 3. Save draft
    const { data: draft } = await supabase
      .from("ai_email_drafts")
      .insert({
        template_id: template.id,
        generated_subject: "Weekly Update – Saffron Emporial",
        generated_html: template.html_wrapper.replace("{{content}}", text),
        generated_text: text,
        generated_by: "weekly_cron",
        approval_token: approvalToken,
      })
      .select()
      .single();

    // 4. Send approval email to admin
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Saffron Emporial <no-reply@yourdomain.com>",
        to: [Deno.env.get("ADMIN_EMAIL")],
        subject: "Approval Needed: Weekly Email Draft",
        html: `
          <p>A new weekly email draft is ready.</p>
          <p><strong>Preview:</strong></p>
          ${draft.generated_html}
          <br/>
          <a href="https://yourdomain.com/api/approve?token=${approvalToken}">✅ Approve</a>
          &nbsp; | &nbsp;
          <a href="https://yourdomain.com/api/reject?token=${approvalToken}">❌ Reject</a>
        `,
      }),
    });

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    console.error("weekly AI draft error:", err);
    return new Response(JSON.stringify({ error: "Failed" }), { status: 500 });
  }
});
