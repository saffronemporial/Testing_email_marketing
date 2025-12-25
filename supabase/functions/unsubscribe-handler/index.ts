import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(
      JSON.stringify({ error: "Unsubscribe token is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Find subscriber by unsubscribe token
    const { data: subscriber, error: findError } = await supabase
      .from("subscribers")
      .select("*")
      .eq("unsubscribe_token", token)
      .single();

    if (findError || !subscriber) {
      return new Response(
        JSON.stringify({ error: "Subscriber not found or already unsubscribed" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET") {
      // Return unsubscribe confirmation page
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribe Confirmation</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #0d153a 0%, #1a237e 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .card {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 20px;
              padding: 40px;
              max-width: 500px;
              width: 100%;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #D4AF37;
              margin-bottom: 10px;
            }
            p {
              margin: 15px 0;
              line-height: 1.6;
              opacity: 0.9;
            }
            .email {
              font-weight: bold;
              color: #D4AF37;
              background: rgba(212, 175, 55, 0.1);
              padding: 8px 16px;
              border-radius: 8px;
              display: inline-block;
              margin: 10px 0;
            }
            .buttons {
              display: flex;
              gap: 15px;
              margin-top: 30px;
            }
            button {
              flex: 1;
              padding: 15px;
              border: none;
              border-radius: 10px;
              font-weight: bold;
              cursor: pointer;
              transition: all 0.3s;
              font-size: 16px;
            }
            .unsubscribe-btn {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
            }
            .cancel-btn {
              background: rgba(255, 255, 255, 0.1);
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            button:hover {
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            .success {
              text-align: center;
              padding: 20px 0;
            }
            .success-icon {
              font-size: 48px;
              margin-bottom: 20px;
              color: #10b981;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Unsubscribe from Saffron Emporial</h1>
            <p>Are you sure you want to unsubscribe from our emails?</p>
            <div class="email">${subscriber.email}</div>
            <p>You'll no longer receive updates, promotions, and news about our premium export products.</p>
            
            <div class="buttons">
              <button class="cancel-btn" onclick="window.history.back()">Cancel</button>
              <button class="unsubscribe-btn" onclick="confirmUnsubscribe()">Unsubscribe</button>
            </div>
          </div>

          <script>
            async function confirmUnsubscribe() {
              const response = await fetch(window.location.href, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              
              if (response.ok) {
                document.querySelector('.card').innerHTML = \`
                  <div class="success">
                    <div class="success-icon">✓</div>
                    <h1>Unsubscribed Successfully</h1>
                    <p>You have been unsubscribed from Saffron Emporial emails.</p>
                    <p>We're sorry to see you go. You can resubscribe anytime.</p>
                    <button class="cancel-btn" onclick="window.close()">Close</button>
                  </div>
                \`;
              } else {
                alert('Error unsubscribing. Please try again.');
              }
            }
          </script>
        </body>
        </html>
      `;

      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
          ...corsHeaders
        }
      });
    }

    if (req.method === "POST") {
      // Process unsubscribe
      const { data, error } = await supabase
        .from("subscribers")
        .update({
          status: "unsubscribed",
          updated_at: new Date().toISOString()
        })
        .eq("id", subscriber.id)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to unsubscribe" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Successfully unsubscribed",
          email: data.email
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response("Method not allowed", { status: 405 });

  } catch (error) {
    console.error("Unsubscribe handler error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});