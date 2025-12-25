import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const campaignId = url.searchParams.get("c");
  const subscriberId = url.searchParams.get("s");
  const encodedUrl = url.searchParams.get("u");

  if (!encodedUrl) {
    return new Response("Missing destination", { status: 400 });
  }

  let destination: string;
  try {
    destination = decodeURIComponent(encodedUrl);
  } catch {
    return new Response("Invalid destination", { status: 400 });
  }

  // Always redirect, even if logging fails
  const redirectResponse = new Response(null, {
    status: 302,
    headers: {
      Location: destination,
      "Cache-Control": "no-store",
    },
  });

  if (!campaignId || !subscriberId) {
    return redirectResponse;
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    /* -------------------------------------------------------
       RECORD CLICK EVENT
    -------------------------------------------------------- */
    await supabase.from("email_click_events").insert({
      campaign_id: campaignId,
      subscriber_id: subscriberId,
      url: destination,
      clicked_at: new Date().toISOString(),
      user_agent: req.headers.get("user-agent"),
    });

    /* -------------------------------------------------------
       UPDATE CAMPAIGN CLICK COUNTER (ATOMIC)
    -------------------------------------------------------- */
    await supabase.rpc("increment_campaign_click", {
      campaign_id: campaignId,
    });
  } catch (err) {
    console.error("track-click error:", err);

    await supabase.from("system_error_logs").insert({
      severity: "warning",
      source: "track-click",
      message: String(err),
      payload: { campaignId, subscriberId, destination },
    });
  }

  return redirectResponse;
});
