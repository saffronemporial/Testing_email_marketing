import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendSMTPMail } from "../_shared/smtpClient.ts";

const BATCH_SIZE = 50;

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const now = new Date().toISOString();

    /* -------------------------------------------------------
       FETCH ELIGIBLE CAMPAIGNS
    -------------------------------------------------------- */
    const { data: campaigns } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("status", "approved")
      .not("scheduled_at", "is", null)
      .lte("scheduled_at", now);

    if (!campaigns || campaigns.length === 0) {
      return new Response("No scheduled campaigns");
    }

    /* -------------------------------------------------------
       SYSTEM SETTINGS
    -------------------------------------------------------- */
    const { data: system } = await supabase
      .from("email_system_settings")
      .select("*")
      .single();

    for (const campaign of campaigns) {
      try {
        /* ---------------------------------------------------
           LOCK CAMPAIGN
        ---------------------------------------------------- */
        const { data: locked } = await supabase
          .from("email_campaigns")
          .update({
            status: "sending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", campaign.id)
          .eq("status", "approved")
          .select()
          .single();

        if (!locked) continue;

        /* ---------------------------------------------------
           LOAD SUBSCRIBERS
        ---------------------------------------------------- */
        const { data: subscribers } = await supabase
          .from("subscribers")
          .select("id, email")
          .eq("status", "active");

        if (!subscribers || subscribers.length === 0) continue;

        /* ---------------------------------------------------
           SUPPRESSION FILTER
        ---------------------------------------------------- */
        const emails = subscribers.map((s) => s.email);
        const { data: suppressed } = await supabase
          .from("email_suppressions")
          .select("email")
          .in("email", emails);

        const suppressedSet = new Set(
          suppressed?.map((s) => s.email)
        );

        const sendList = subscribers.filter(
          (s) => !suppressedSet.has(s.email)
        );

        /* ---------------------------------------------------
           RATE LIMIT ENFORCER
        ---------------------------------------------------- */
        const rateRes = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/rate-limit-enforcer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get(
                "SUPABASE_SERVICE_ROLE_KEY"
              )}`,
            },
            body: JSON.stringify({ requested: sendList.length }),
          }
        );

        const rate = await rateRes.json();
        if (!rate.allowed || rate.allow_count <= 0) {
          throw new Error("Rate limit exceeded");
        }

        const finalList = sendList.slice(0, rate.allow_count);

        /* ---------------------------------------------------
           SEND LOOP
        ---------------------------------------------------- */
        let sent = 0;
        let failed = 0;

        for (let i = 0; i < finalList.length; i += BATCH_SIZE) {
          const batch = finalList.slice(i, i + BATCH_SIZE);

          for (const user of batch) {
            let providerUsed = "resend";
            let delivered = false;

            try {
              /* ---- TRY RESEND ---- */
              const res = await fetch(
                "https://api.resend.com/emails",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${Deno.env.get(
                      "RESEND_API_KEY"
                    )}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    from: system.smtp_from_email,
                    to: user.email,
                    subject: campaign.subject,
                    html: campaign.content_html,
                  }),
                }
              );

              if (!res.ok) throw new Error("Resend failed");
              delivered = true;
            } catch {
              try {
                /* ---- FALLBACK: DOMAIN SMTP ---- */
                providerUsed = "smtp_domain";
                await sendSMTPMail(
                  {
                    host: Deno.env.get("SMTP_DOMAIN_HOST")!,
                    port: Number(
                      Deno.env.get("SMTP_DOMAIN_PORT")
                    ),
                    username: Deno.env.get("SMTP_DOMAIN_USER")!,
                    password: Deno.env.get(
                      "SMTP_DOMAIN_PASSWORD"
                    )!,
                    from: system.smtp_from_email,
                  },
                  {
                    to: user.email,
                    subject: campaign.subject,
                    html: campaign.content_html,
                  }
                );
                delivered = true;
              } catch {
                /* ---- FALLBACK: GMAIL SMTP ---- */
                providerUsed = "smtp_gmail";
                await sendSMTPMail(
                  {
                    host: Deno.env.get("SMTP_GMAIL_HOST")!,
                    port: Number(
                      Deno.env.get("SMTP_GMAIL_PORT")
                    ),
                    username: Deno.env.get("SMTP_GMAIL_USER")!,
                    password: Deno.env.get(
                      "SMTP_GMAIL_APP_PASSWORD"
                    )!,
                    from: system.smtp_from_email,
                  },
                  {
                    to: user.email,
                    subject: campaign.subject,
                    html: campaign.content_html,
                  }
                );
                delivered = true;
              }
            }

            if (delivered) {
              sent++;
              await supabase.from("email_logs").insert({
                campaign_id: campaign.id,
                subscriber_id: user.id,
                email: user.email,
                status: "sent",
                provider: providerUsed,
                sent_at: new Date().toISOString(),
              });

              await supabase
                .from("email_system_settings")
                .update({
                  last_provider_used: providerUsed,
                })
                .eq("id", 1);
            } else {
              failed++;
              await supabase.from("email_logs").insert({
                campaign_id: campaign.id,
                subscriber_id: user.id,
                email: user.email,
                status: "failed",
              });
            }
          }
        }

        /* ---------------------------------------------------
           MARK COMPLETED
        ---------------------------------------------------- */
        await supabase
          .from("email_campaigns")
          .update({
            status: "completed",
            sent_count: sent,
            failed_count: failed,
            updated_at: new Date().toISOString(),
          })
          .eq("id", campaign.id);
      } catch (campaignErr) {
        console.error("Scheduled send error:", campaignErr);

        await supabase.from("system_error_logs").insert({
          severity: "critical",
          source: "send-scheduled-campaigns",
          message: String(campaignErr),
          payload: { campaign_id: campaign.id },
        });
      }
    }

    return new Response("Scheduled campaigns processed");
  } catch (err) {
    console.error("Scheduler fatal error:", err);

    await supabase.from("system_error_logs").insert({
      severity: "critical",
      source: "send-scheduled-campaigns",
      message: String(err),
      payload: null,
    });

    return new Response("Scheduler error", { status: 500 });
  }
});
