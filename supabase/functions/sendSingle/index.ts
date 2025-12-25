// supabase/functions/sendSingle/index.ts
// Edge Function — sendSingle
// Purpose: Handles a single communication request (email or WhatsApp) via EmailJS / Twilio
// Deploy after testing direct methods successfully
// To deploy: supabase functions deploy sendSingle --project-ref your-project-id

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

// Load environment variables
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const EMAILJS_SERVICE_ID = Deno.env.get("EMAILJS_SERVICE_ID");
const EMAILJS_TEMPLATE_ID = Deno.env.get("EMAILJS_TEMPLATE_ID");
const EMAILJS_PUBLIC_KEY = Deno.env.get("EMAILJS_PUBLIC_KEY");

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const { channel, recipient, message, subject } = await req.json();
    if (!channel || !recipient || !message) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400 });
    }

    let response: any;
    let status = "sent";

    if (channel === "whatsapp") {
      // Twilio WhatsApp API
      const base64Auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
      const twilioResp = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${base64Auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: "whatsapp:+14155238886", // your Twilio sandbox or verified number
            To: `whatsapp:${recipient}`,
            Body: message,
          }),
        }
      );
      response = await twilioResp.json();
      if (!twilioResp.ok) status = "failed";
    } else if (channel === "email") {
      // EmailJS API
      const emailResp = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: { to_email: recipient, subject, message },
        }),
      });
      response = await emailResp.json();
      if (!emailResp.ok) status = "failed";
    } else {
      return new Response(JSON.stringify({ error: "Unsupported channel" }), { status: 400 });
    }

    // Log to communication_logs
    await supabase.from("communication_logs").insert([
      {
        channel,
        recipient,
        message,
        subject,
        status,
        provider_response: response,
        sent_at: new Date().toISOString(),
      },
    ]);

    return new Response(JSON.stringify({ success: true, status, response }), { status: 200 });
  } catch (err) {
    console.error("Edge Function Error:", err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
});
// To test locally, run: supabase functions serve sendSingle --project-ref your-project-id
// Then send a POST request to http://localhost:54321/functions/v1/sendSingle with appropriate JSON body.
// Example JSON body:
/*
{
  "channel": "email",
  "recipient": "<recipient_email>",
  "message": "<your_message>",
  "subject": "<your_subject>"
}   
{
  "channel": "whatsapp",
  "recipient": "<recipient_whatsapp_number>",
  "message": "<your_message>"
}
*/
// Remember to replace placeholders with actual values before deploying.
// After testing, deploy with: supabase functions deploy sendSingle --project-ref your-project-id

// how to deploy:
// supabase functions deploy sendSingle --project-ref your-project-id
//supabase functions invoke sendSingle --body '{"channel":"email","recipient":"abc@gmail.com","message":"Test"}'
