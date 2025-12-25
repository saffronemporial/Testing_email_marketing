// supabase/functions/send-email-with-fallback/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Fix 1: Use correct resend import
import { Resend } from "https://esm.sh/resend@6.0.2";
// Fix 2: Use correct nodemailer import
import nodemailer from "npm:nodemailer@6.9.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
  tags?: string[];
  tracking?: boolean;
}

interface ProviderConfig {
  provider_type: 'resend' | 'smtp';
  name: string;
  config: any;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { campaign_id, draft_id, test_mode = false } = await req.json();

    if (!campaign_id && !draft_id) {
      return new Response(
        JSON.stringify({ error: "campaign_id or draft_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Load email content
    let emailData: EmailData;
    let campaignId: string | null = null;

    if (campaign_id) {
      const { data: campaign, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .eq("id", campaign_id)
        .single();

      if (error || !campaign) {
        return new Response(
          JSON.stringify({ error: "Campaign not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      emailData = {
        to: [], // Will be populated with subscribers
        subject: campaign.subject,
        html: campaign.content_html,
        text: campaign.content_text,
        tags: campaign.tags || []
      };
      campaignId = campaign.id;

      // Update campaign status
      await supabase
        .from("email_campaigns")
        .update({ 
          status: "sending",
          sent_at: new Date().toISOString()
        })
        .eq("id", campaign_id);

    } else if (draft_id) {
      const { data: draft, error } = await supabase
        .from("ai_email_drafts")
        .select("*")
        .eq("id", draft_id)
        .single();

      if (error || !draft) {
        return new Response(
          JSON.stringify({ error: "Draft not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      emailData = {
        to: [],
        subject: draft.generated_subject,
        html: draft.generated_html,
        text: draft.generated_text,
        tags: ["ai-generated"]
      };
    } else {
      throw new Error("No content source provided");
    }

    // 2. Load active subscribers
    const { data: subscribers, error: subsError } = await supabase
      .from("subscribers")
      .select("id, email, name, unsubscribe_token")
      .eq("status", "active");

    if (subsError) throw subsError;
    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No active subscribers",
          sent: 0,
          failed: 0
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Get active providers
    const { data: providers, error: providersError } = await supabase
      .from("email_providers")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: true });

    if (providersError || !providers || providers.length === 0) {
      throw new Error("No active email providers configured");
    }

    const primaryProvider = providers[0];
    const fallbackProvider = providers[1];

    // 4. Prepare email with tracking
    const trackingToken = crypto.randomUUID();
    const trackingPixelUrl = `${Deno.env.get("APP_URL")}/api/track/open/${trackingToken}`;
    
    // Add tracking pixel to HTML
    const trackedHtml = emailData.html.replace(
      "</body>",
      `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" /></body>`
    );

    // Replace tracking tokens in links
    const processedHtml = trackedHtml.replace(
      /href="(.*?)"/g,
      (match, url) => {
        if (url.startsWith("http")) {
          const trackedUrl = `${Deno.env.get("APP_URL")}/api/track/click/${trackingToken}?url=${encodeURIComponent(url)}`;
          return `href="${trackedUrl}"`;
        }
        return match;
      }
    );

    emailData.html = processedHtml;

    // 5. Send emails
    const BATCH_SIZE = 25; // Smaller batches for better error handling
    let sentCount = 0;
    let failedCount = 0;
    const failedEmails: Array<{ email: string; error: string }> = [];

    // Split subscribers into batches
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (subscriber) => {
        try {
          // Personalize email
          const personalizedHtml = emailData.html
            .replace(/{{name}}/g, subscriber.name || "Valued Customer")
            .replace(/{{email}}/g, subscriber.email)
            .replace(/{{unsubscribe_link}}/g, 
              `${Deno.env.get("APP_URL")}/unsubscribe/${subscriber.unsubscribe_token}`
            );

          const emailPayload = {
            ...emailData,
            to: subscriber.email,
            html: personalizedHtml,
            // Add unsubscribe link to text version
            text: emailData.text + `\n\nUnsubscribe: ${Deno.env.get("APP_URL")}/unsubscribe/${subscriber.unsubscribe_token}`
          };

          // Try primary provider
          let result = await sendWithProvider(primaryProvider, emailPayload);
          
          // If primary fails and we have fallback, try it
          if (!result.success && fallbackProvider) {
            console.log(`Primary provider failed for ${subscriber.email}, trying fallback...`);
            result = await sendWithProvider(fallbackProvider, emailPayload);
          }

          // Log the result
          await logEmailResult(supabase, {
            campaignId,
            subscriberId: subscriber.id,
            email: subscriber.email,
            success: result.success,
            provider: result.provider,
            error: result.error,
            messageId: result.messageId
          });

          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
            failedEmails.push({
              email: subscriber.email,
              error: result.error || "Unknown error"
            });
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));

        } catch (error) {
          console.error(`Error sending to ${subscriber.email}:`, error);
          failedCount++;
          failedEmails.push({
            email: subscriber.email,
            error: error.message
          });
        }
      });

      // Wait for batch to complete
      await Promise.allSettled(batchPromises);
    }

    // 6. Update campaign statistics
    if (campaignId) {
      await supabase
        .from("email_campaigns")
        .update({
          status: "completed",
          sent_count: sentCount,
          failed_count: failedCount,
          total_recipients: subscribers.length,
          updated_at: new Date().toISOString()
        })
        .eq("id", campaignId);
    }

    // 7. Return results
    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        total: subscribers.length,
        failed_emails: test_mode ? failedEmails : undefined,
        providers_used: {
          primary: primaryProvider.name,
          fallback: fallbackProvider?.name || "none"
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("send-email-with-fallback error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// Helper function to send with specific provider
async function sendWithProvider(provider: ProviderConfig, emailData: EmailData) {
  try {
    switch (provider.provider_type) {
      case 'resend':
        return await sendWithResend(provider.config, emailData);
      case 'smtp':
        return await sendWithSMTP(provider.config, emailData);
      default:
        throw new Error(`Unsupported provider type: ${provider.provider_type}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      provider: provider.name
    };
  }
}

// In your sendWithResend function, fix the usage:
async function sendWithResend(config: any, emailData: EmailData) {
  const resendClient = new Resend(config.api_key); // Changed from resend.Resend

  const response = await resendClient.emails.send({
    from: emailData.from || config.from_email,
    to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
    reply_to: emailData.replyTo,
    cc: emailData.cc,
    bcc: emailData.bcc,
    attachments: emailData.attachments,
    tags: emailData.tags?.map(tag => ({ name: tag, value: 'true' }))
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return {
    success: true,
    messageId: response.data?.id,
    provider: 'Resend'
  };
}

// SMTP implementation
async function sendWithSMTP(config: any, emailData: EmailData) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure || false,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: emailData.from || config.from_email,
    to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
    replyTo: emailData.replyTo,
    cc: emailData.cc?.join(', '),
    bcc: emailData.bcc?.join(', '),
    attachments: emailData.attachments
  };

  const info = await transporter.sendMail(mailOptions);

  return {
    success: true,
    messageId: info.messageId,
    provider: 'SMTP'
  };
}

// Log email result to database
async function logEmailResult(
  supabase: any,
  data: {
    campaignId: string | null;
    subscriberId: string;
    email: string;
    success: boolean;
    provider: string;
    error?: string;
    messageId?: string;
  }
) {
  try {
    await supabase
      .from("email_logs")
      .insert({
        campaign_id: data.campaignId,
        subscriber_id: data.subscriberId,
        email: data.email,
        status: data.success ? "sent" : "failed",
        provider_response: {
          provider: data.provider,
          message_id: data.messageId,
          error: data.error
        },
        sent_at: new Date().toISOString()
      });
  } catch (error) {
    console.error("Failed to log email result:", error);
  }
}