import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ONE_PIXEL = Uint8Array.from([
  71,73,70,56,57,97,1,0,1,0,128,0,0,0,0,0,255,255,255,33,249,4,1,0,0,1,0,44,0,0,0,0,1,0,1,0,0,2,2,68,1,0,59
]);

serve(async (req) => {
  const url = new URL(req.url);
  const campaignId = url.searchParams.get("c");
  const subscriberId = url.searchParams.get("s");

  const headers = {
    "Content-Type": "image/gif",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
  };

  if (!campaignId || !subscriberId) {
    return new Response(ONE_PIXEL, { headers });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    /* -------------------------------------------------------
       RECORD OPEN EVENT
    -------------------------------------------------------- */
    await supabase.from("email_open_events").insert({
      campaign_id: campaignId,
      subscriber_id: subscriberId,
      opened_at: new Date().toISOString(),
      user_agent: req.headers.get("user-agent"),
    });

    /* -------------------------------------------------------
       UPDATE CAMPAIGN COUNTER (ATOMIC)
    -------------------------------------------------------- */
    await supabase.rpc("increment_campaign_open", {
      campaign_id: campaignId,
    });
  } catch (err) {
    console.error("track-open error:", err);

    await supabase.from("system_error_logs").insert({
      severity: "warning",
      source: "track-open",
      message: String(err),
      payload: { campaignId, subscriberId },
    });
  }

  /* -------------------------------------------------------
     RETURN TRACKING PIXEL
  -------------------------------------------------------- */
  return new Response(ONE_PIXEL, { headers });
});
