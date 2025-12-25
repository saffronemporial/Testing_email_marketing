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

  try {
    const body = await req.json();
    const emailRaw = body?.email;
    const source = body?.source || "public";

    if (!emailRaw || typeof emailRaw !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const email = emailRaw.trim().toLowerCase();

    if (!email.includes("@") || email.length < 5) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    /* ----------------------------------------------------
       CHECK SUPPRESSION
    ----------------------------------------------------- */
    const { data: suppressed } = await supabase
      .from("email_suppressions")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (suppressed) {
      return new Response(
        JSON.stringify({
          status: "blocked",
          reason: "Email is suppressed",
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    /* ----------------------------------------------------
       CHECK EXISTING SUBSCRIBER
    ----------------------------------------------------- */
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({
          status: "exists",
          message: "Already subscribed",
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    /* ----------------------------------------------------
       INSERT SUBSCRIBER
    ----------------------------------------------------- */
    const { error: insertError } = await supabase
      .from("subscribers")
      .insert({
        email,
        status: "active",
        source,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        status: "subscribed",
        message: "Subscription successful",
      }),
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error("subscribe-user error:", err);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
