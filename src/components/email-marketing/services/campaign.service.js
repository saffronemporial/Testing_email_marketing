import { supabase } from "../../../supabaseClient";

/* ---------------- CAMPAIGN CRUD ---------------- */

export async function fetchCampaigns() {
  const { data, error } = await supabase
    .from("email_campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createCampaign(payload) {
  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({
      ...payload,
      status: "draft",
      approval_status: "approved", // admin/staff flow already enforced elsewhere
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCampaign(id, payload) {
  const { data, error } = await supabase
    .from("email_campaigns")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------- SAFETY CHECKS ---------------- */

export async function assertCampaignSendable(id) {
  const { data, error } = await supabase
    .from("email_campaigns")
    .select("status, sent_at")
    .eq("id", id)
    .single();

  if (error) throw error;
  if (data.status !== "draft" && data.status !== "scheduled") {
    throw new Error("Campaign already sent or sending");
  }
}

/* ---------------- SEND NOW ---------------- */

export async function sendNowCampaign(campaignId) {
  await assertCampaignSendable(campaignId);

  const res = await fetch("/functions/v1/send-now-campaign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaign_id: campaignId }),
  });

  if (!res.ok) {
    const j = await res.json();
    throw new Error(j.error || "Send failed");
  }

  return res.json();
}
