import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const trackingToken = url.pathname.split('/').pop();
  const destinationUrl = url.searchParams.get('url');

  if (!trackingToken || !destinationUrl) {
    return new Response("Invalid tracking parameters", { status: 400 });
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
      // Redirect anyway, but log error
      console.error("Tracking not found:", trackingToken);
      return Response.redirect(decodeURIComponent(destinationUrl), 302);
    }

    // Update clicked_at if not already clicked
    if (!tracking.clicked_at) {
      const clickedLinks = Array.isArray(tracking.clicked_links) 
        ? [...tracking.clicked_links, destinationUrl]
        : [destinationUrl];

      await supabase
        .from("email_tracking")
        .update({
          clicked_at: new Date().toISOString(),
          clicked_links: clickedLinks,
          device_info: {
            ...tracking.device_info,
            user_agent: req.headers.get("user-agent"),
            ip: req.headers.get("x-forwarded-for") || "unknown"
          }
        })
        .eq("id", tracking.id);

      // Update campaign analytics
      await updateCampaignClickAnalytics(supabase, tracking.campaign_id);
    }

    // Redirect to destination URL
    return Response.redirect(decodeURIComponent(destinationUrl), 302);

  } catch (error) {
    console.error("Track email click error:", error);
    // Still redirect even if tracking fails
    return Response.redirect(decodeURIComponent(destinationUrl), 302);
  }
});

async function updateCampaignClickAnalytics(supabase: any, campaignId: string) {
  if (!campaignId) return;

  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Check if analytics entry exists for today
    const { data: existing } = await supabase
      .from("campaign_analytics_daily")
      .select("id, clicks, unique_clicks")
      .eq("campaign_id", campaignId)
      .eq("date", today)
      .single();

    if (existing) {
      // Update existing entry
      await supabase
        .from("campaign_analytics_daily")
        .update({
          clicks: existing.clicks + 1,
          unique_clicks: existing.unique_clicks + 1 // Simplified
        })
        .eq("id", existing.id);
    } else {
      // Create new entry
      await supabase
        .from("campaign_analytics_daily")
        .insert({
          campaign_id: campaignId,
          date: today,
          clicks: 1,
          unique_clicks: 1,
          opens: 0,
          emails_sent: 0,
          emails_delivered: 0,
          unsubscribes: 0,
          bounces: 0,
          spam_complaints: 0
        });
    }

    // Update campaign click rate
    const { data: campaign } = await supabase
      .from("email_campaigns")
      .select("sent_count")
      .eq("id", campaignId)
      .single();

    if (campaign && campaign.sent_count > 0) {
      const { data: totalClicks } = await supabase
        .from("email_tracking")
        .select("id", { count: 'exact', head: true })
        .eq("campaign_id", campaignId)
        .not("clicked_at", "is", null);

      const clickRate = ((totalClicks?.count || 0) / campaign.sent_count) * 100;

      await supabase
        .from("email_campaigns")
        .update({
          click_rate: clickRate,
          updated_at: new Date().toISOString()
        })
        .eq("id", campaignId);
    }

  } catch (error) {
    console.error("Update campaign click analytics error:", error);
  }
}