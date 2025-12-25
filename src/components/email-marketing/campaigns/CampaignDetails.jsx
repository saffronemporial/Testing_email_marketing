// src/components/email-marketing/campaigns/CampaignDetail.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import CampaignScheduler from "../scheduling/CampaignScheduler";
import "./campaignDetail.css";

export default function CampaignDetail() {
  const { campaignId } = useParams();

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data: c, error } = await supabase
          .from("email_campaigns")
          .select(`
            id, name, status, scheduled_at, created_at,
            email_templates(name)
          `)
          .eq("id", campaignId)
          .single();

        if (error) throw error;

        const { data: s } = await supabase
          .from("email_campaign_stats")
          .select("*")
          .eq("campaign_id", campaignId)
          .single();

        if (!mounted) return;

        setCampaign(c);
        setStats(s);
      } catch (err) {
        console.error(err);
        setError("Failed to load campaign");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [campaignId]);

  /* -------------------------------------------------------
     ACTIONS
  -------------------------------------------------------- */
  const sendNow = async () => {
    setSending(true);
    try {
      await supabase.functions.invoke("send-campaign-now", {
        body: { campaign_id: campaignId }
      });
    } catch (err) {
      alert("Failed to send campaign");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="em-card">Loading campaign…</div>;
  if (error) return <div className="em-card em-badge-danger">{error}</div>;

  return (
    <div className="em-fade-up campaign-detail-wrap">

      <div className="campaign-detail-header">
        <h2>{campaign.name}</h2>
        <span
          className={`em-badge em-badge-${
            campaign.status === "sent"
              ? "success"
              : campaign.status === "failed"
              ? "danger"
              : "warning"
          }`}
        >
          {campaign.status}
        </span>
      </div>

      <div className="em-grid-3">
        <Info label="Template" value={campaign.email_templates?.name} />
        <Info label="Created" value={new Date(campaign.created_at).toLocaleDateString()} />
        <Info label="Scheduled" value={campaign.scheduled_at || "—"} />
      </div>

      {stats && (
        <div className="em-grid-4 mt-4">
          <Info label="Sent" value={stats.emails_sent} />
          <Info label="Delivered" value={stats.emails_delivered} />
          <Info label="Opened" value={stats.emails_opened} />
          <Info label="Clicked" value={stats.emails_clicked} />
        </div>
      )}

      <div className="campaign-actions mt-4">
        <button
          className="em-btn-primary"
          disabled={sending || campaign.status !== "approved"}
          onClick={sendNow}
        >
          {sending ? "Sending…" : "Send Now"}
        </button>
        <CampaignScheduler campaignId={campaign.id} />
      </div>

         <Link
          to={`/admin/email-marketing/campaigns/${campaign.id}/edit`}
          className="em-btn-ghost"
           >
           Edit Campaign
           </Link>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="em-card">
      <span className="em-muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
