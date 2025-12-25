import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const trackingToken = url.pathname.split('/').pop();

  if (!trackingToken) {
    return new Response("Invalid tracking token", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Find the tracking record
    const { data: tracking, error } = await supabase
      .from("email_tracking")
      .select("*")
      .eq("tracking_token", trackingToken)
      .single();

    if (error || !tracking) {
      return new Response("Tracking not found", { status: 404 });
    }

    // Update opened_at if not already opened
    if (!tracking.opened_at) {
      await supabase
        .from("email_tracking")
        .update({
          opened_at: new Date().toISOString(),
          device_info: {
            user_agent: req.headers.get("user-agent"),
            ip: req.headers.get("x-forwarded-for") || "unknown"
          }
        })
        .eq("id", tracking.id);

      // Update campaign analytics
      await updateCampaignAnalytics(supabase, tracking.campaign_id);
    }

    // Return 1x1 transparent GIF
    const pixel = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
      0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x2c,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02,
      0x02, 0x44, 0x01, 0x00, 0x3b
    ]);

    return new Response(pixel, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });

  } catch (error) {
    console.error("Track email open error:", error);
    return new Response("Internal server error", { status: 500 });
  }
});

async function updateCampaignAnalytics(supabase: any, campaignId: string) {
  if (!campaignId) return;

  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Check if analytics entry exists for today
    const { data: existing } = await supabase
      .from("campaign_analytics_daily")
      .select("id, opens, unique_opens")
      .eq("campaign_id", campaignId)
      .eq("date", today)
      .single();

    if (existing) {
      // Update existing entry
      await supabase
        .from("campaign_analytics_daily")
        .update({
          opens: existing.opens + 1,
          unique_opens: existing.unique_opens + 1 // This should be based on unique opens, but we're simplifying
        })
        .eq("id", existing.id);
    } else {
      // Create new entry
      await supabase
        .from("campaign_analytics_daily")
        .insert({
          campaign_id: campaignId,
          date: today,
          opens: 1,
          unique_opens: 1,
          emails_sent: 0,
          emails_delivered: 0,
          clicks: 0,
          unsubscribes: 0,
          bounces: 0,
          spam_complaints: 0
        });
    }

    // Update campaign open rate
    const { data: campaign } = await supabase
      .from("email_campaigns")
      .select("sent_count")
      .eq("id", campaignId)
      .single();

    if (campaign && campaign.sent_count > 0) {
      const { data: totalOpens } = await supabase
        .from("email_tracking")
        .select("id", { count: 'exact', head: true })
        .eq("campaign_id", campaignId)
        .not("opened_at", "is", null);

      const openRate = ((totalOpens?.count || 0) / campaign.sent_count) * 100;

      await supabase
        .from("email_campaigns")
        .update({
          open_rate: openRate,
          updated_at: new Date().toISOString()
        })
        .eq("id", campaignId);
    }

  } catch (error) {
    console.error("Update campaign analytics error:", error);
  }
}