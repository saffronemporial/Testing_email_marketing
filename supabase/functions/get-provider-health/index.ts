import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all providers
    const { data: providers, error } = await supabase
      .from("email_providers")
      .select("*")
      .order("priority", { ascending: true });

    if (error) throw error;

    // Check health of each provider
    const healthChecks = await Promise.all(
      (providers || []).map(async (provider) => {
        const startTime = Date.now();
        let healthy = false;
        let latency = 0;

        try {
          if (provider.provider_type === 'resend') {
            // Check Resend API
            const apiKey = Deno.env.get("RESEND_API_KEY") || provider.config.api_key;
            if (!apiKey) {
              healthy = false;
            } else {
              const response = await fetch("https://api.resend.com/emails", {
                method: "HEAD",
                headers: {
                  "Authorization": `Bearer ${apiKey}`
                }
              });
              healthy = response.status === 200;
            }
          } else {
            // For SMTP, we'll just check if config exists
            healthy = !!provider.config.host && !!provider.config.port;
          }

          latency = Date.now() - startTime;
        } catch (error) {
          healthy = false;
          latency = Date.now() - startTime;
        }

        return {
          id: provider.id,
          name: provider.name,
          type: provider.provider_type,
          healthy,
          latency,
          priority: provider.priority,
          is_default: provider.is_default,
          success_rate: provider.success_rate,
          monthly_usage: provider.monthly_usage,
          last_used_at: provider.last_used_at,
          config: {
            ...provider.config,
            // Hide sensitive data
            api_key: provider.config.api_key ? "***" + provider.config.api_key.slice(-4) : undefined,
            auth: provider.config.auth ? {
              user: provider.config.auth.user ? "***" + provider.config.auth.user.slice(-4) : undefined,
              pass: "***"
            } : undefined
          }
        };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        providers: healthChecks,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Get provider health error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to check provider health",
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});