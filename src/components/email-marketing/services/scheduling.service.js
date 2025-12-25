import { supabase } from "../../../supabaseClient";

/* ---------------- CREATE / UPDATE SCHEDULE ---------------- */

export async function scheduleCampaign({
  campaignId,
  scheduledAt,
  timezone,
  recurrenceRule = null,
}) {
  const { data, error } = await supabase
    .from("email_campaigns")
    .update({
      status: "scheduled",
      scheduled_at: scheduledAt,
      scheduled_timezone: timezone,
      recurrence_rule: recurrenceRule,
    })
    .eq("id", campaignId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ---------------- CANCEL SCHEDULE ---------------- */

export async function cancelSchedule(campaignId) {
  const { data, error } = await supabase
    .from("email_campaigns")
    .update({
      status: "draft",
      scheduled_at: null,
      scheduled_timezone: null,
      recurrence_rule: null,
    })
    .eq("id", campaignId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ---------------- FETCH SCHEDULED CAMPAIGNS ---------------- */

export async function fetchScheduledCampaigns() {
  const { data, error } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("status", "scheduled")
    .order("scheduled_at", { ascending: true });

  if (error) throw error;
  return data;
}

/* ---------------- MANUAL CRON TRIGGER (ADMIN) ---------------- */

export async function triggerSchedulerNow() {
  const res = await fetch("/functions/v1/send-scheduled-campaigns", {
    method: "POST",
  });

  if (!res.ok) {
    const j = await res.json();
    throw new Error(j.error || "Scheduler execution failed");
  }

  return res.json();
}
