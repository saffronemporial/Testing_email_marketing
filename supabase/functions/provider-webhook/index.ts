import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Normalize provider-specific payloads into a common shape.
 * This keeps frontend + analytics stable even if provider changes.
 */
function normalizeEvent(body: any) {
  // Resend-style example
  if (body?.type && body?.data?.email) {
    return {
      provider: "resend",
      event: body.type,
      email: body.data.email,
      message_id: body.data.id || null,
      campaign_id: body.data.tags?.campaign_id || null,
      subscriber_id: body.data.tags?.subscriber_id || null,
      raw: body,
    };
  }

  // Fallback / unknown provider
  return {
    provider: "unknown",
    event: body?.event || "unknown",
    email: body?.email || null,
    message_id: body?.message_id || null,
    campaign_id: body?.campaign_id || null,
    subscriber_id: body?.subscriber_id || null,
    raw: body,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();
    const evt = normalizeEvent(body);

    if (!evt.email) {
      throw new Error("Webhook missing email");
    }

    /* -------------------------------------------------------
       UPDATE EMAIL LOG (BEST-EFFORT)
    -------------------------------------------------------- */
    await supabase
      .from("email_logs")
      .update({
        final_status: evt.event,
        provider: evt.provider,
        provider_message_id: evt.message_id,
        updated_at: new Date().toISOString(),
      })
      .eq("email", evt.email)
      .eq("campaign_id", evt.campaign_id);

    /* -------------------------------------------------------
       HANDLE NEGATIVE EVENTS
    -------------------------------------------------------- */
    if (
      evt.event === "bounced" ||
      evt.event === "complained" ||
      evt.event === "unsubscribed"
    ) {
      // Add to suppression list (idempotent)
      await supabase
        .from("email_suppressions")
        .upsert(
          {
            email: evt.email,
            reason: evt.event,
            source: evt.provider,
            created_at: new Date().toISOString(),
          },
          { onConflict: "email" }
        );
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("provider-webhook error:", err);

    await supabase.from("system_error_logs").insert({
      severity: "warning",
      source: "provider-webhook",
      message: String(err),
      payload: null,
    });

    // Always return 200 so providers do not retry aggressively
    return new Response("ok", { status: 200 });
  }
});
