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
    const { campaign_id, approved_by } = await req.json();

    if (!campaign_id || !approved_by) {
      return new Response(
        JSON.stringify({ error: "campaign_id and approved_by required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    /* -------------------------------------------------------
       LOAD CAMPAIGN
    -------------------------------------------------------- */
    const { data: campaign, error: campErr } = await supabase
      .from("email_campaigns")
      .select("id, status, subject, draft_blocks")
      .eq("id", campaign_id)
      .single();

    if (campErr || !campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.status !== "draft_ready") {
      return new Response(
        JSON.stringify({
          error: "Campaign is not ready for approval",
          status: campaign.status,
        }),
        { status: 409, headers: corsHeaders }
      );
    }

    if (!campaign.subject || !campaign.draft_blocks) {
      return new Response(
        JSON.stringify({
          error: "Campaign content incomplete",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    /* -------------------------------------------------------
       APPROVE & LOCK
    -------------------------------------------------------- */
    const now = new Date().toISOString();

    await supabase
      .from("email_campaigns")
      .update({
        status: "approved",
        approved_at: now,
        updated_at: now,
      })
      .eq("id", campaign_id);

    /* -------------------------------------------------------
       AUDIT LOG
    -------------------------------------------------------- */
    await supabase.from("approval_history").insert({
      campaign_id,
      approved_by,
      approved_at: now,
      action: "approved",
    });

    return new Response(
      JSON.stringify({
        status: "approved",
        approved_at: now,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("approve-campaign error:", err);

    await supabase.from("system_error_logs").insert({
      severity: "critical",
      source: "approve-campaign",
      message: String(err),
      payload: null,
    });

    return new Response(
      JSON.stringify({ error: "Failed to approve campaign" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
