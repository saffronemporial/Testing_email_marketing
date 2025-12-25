import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Request body:
 * {
 *   "requested": number
 * }
 *
 * Response:
 * {
 *   allowed: boolean,
 *   allow_count: number
 * }
 */

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { requested } = await req.json();

    if (!requested || requested <= 0) {
      return new Response(
        JSON.stringify({ allowed: false, reason: "Invalid request" }),
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       LOAD SYSTEM LIMITS
    -------------------------------------------------------- */
    const { data: system } = await supabase
      .from("email_system_settings")
      .select("daily_limit, hourly_limit")
      .single();

    if (!system) {
      return new Response(
        JSON.stringify({ allowed: false, reason: "System config missing" }),
        { status: 500 }
      );
    }

    /* -------------------------------------------------------
       LOAD RATE STATE
    -------------------------------------------------------- */
    const { data: rate } = await supabase
      .from("email_rate_limits")
      .select("*")
      .eq("id", 1)
      .single();

    const now = new Date();
    const currentHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours()
    ).toISOString();

    let sentToday = rate.sent_today;
    let sentThisHour = rate.sent_this_hour;

    /* -------------------------------------------------------
       RESET WINDOWS IF NEEDED
    -------------------------------------------------------- */
    if (rate.date !== now.toISOString().slice(0, 10)) {
      sentToday = 0;
    }

    if (rate.hourly_window !== currentHour) {
      sentThisHour = 0;
    }

    /* -------------------------------------------------------
       CALCULATE ALLOWANCE
    -------------------------------------------------------- */
    const dailyRemaining = system.daily_limit - sentToday;
    const hourlyRemaining = system.hourly_limit - sentThisHour;

    const allowCount = Math.max(
      0,
      Math.min(requested, dailyRemaining, hourlyRemaining)
    );

    if (allowCount <= 0) {
      return new Response(
        JSON.stringify({ allowed: false, allow_count: 0 }),
        { status: 200 }
      );
    }

    /* -------------------------------------------------------
       COMMIT RESERVATION (ATOMIC UPDATE)
    -------------------------------------------------------- */
    await supabase
      .from("email_rate_limits")
      .update({
        date: now.toISOString().slice(0, 10),
        hourly_window: currentHour,
        sent_today: sentToday + allowCount,
        sent_this_hour: sentThisHour + allowCount,
        updated_at: now.toISOString(),
      })
      .eq("id", 1);

    return new Response(
      JSON.stringify({
        allowed: true,
        allow_count: allowCount,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("rate-limit-enforcer error:", err);

    return new Response(
      JSON.stringify({ allowed: false, reason: "Internal error" }),
      { status: 500 }
    );
  }
});
