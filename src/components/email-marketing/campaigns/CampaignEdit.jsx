import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./campaignEdit.css";

export default function CampaignEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [segments, setSegments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------
     LOAD CAMPAIGN
  -------------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      const [{ data: camp }, { data: tpls }, { data: segs }] =
        await Promise.all([
          supabase.from("email_campaigns").select("*").eq("id", id).single(),
          supabase.from("email_templates").select("id, name"),
          supabase.from("recipient_segments").select("id, name")
        ]);

      if (camp.status === "sending" || camp.status === "completed") {
        navigate(`/admin/email-marketing/campaigns/${id}`);
        return;
      }

      setCampaign(camp);
      setTemplates(tpls || []);
      setSegments(segs || []);
    };

    load();
  }, [id, navigate]);

  /* -------------------------------------------------------
     SAVE
  -------------------------------------------------------- */
  const save = async () => {
    setSaving(true);
    setError(null);

    try {
      await supabase
        .from("email_campaigns")
        .update({
          name: campaign.name,
          subject: campaign.subject,
          template_id: campaign.template_id,
          segment_id: campaign.segment_id
        })
        .eq("id", id);

      navigate(`/admin/email-marketing/campaigns/${id}`);
    } catch {
      setError("Failed to update campaign");
    } finally {
      setSaving(false);
    }
  };

  if (!campaign) return <div className="em-card">Loading campaign…</div>;

  return (
    <div className="em-fade-up campaign-edit-root">

      {/* HEADER */}
      <div className="campaign-edit-header">
        <h2>Edit Campaign</h2>
        <span className="em-muted">
          Changes allowed before approval or scheduling
        </span>
      </div>

      {/* FORM */}
      <div className="em-card">
        <label>Campaign Name</label>
        <input
          value={campaign.name}
          onChange={(e) =>
            setCampaign({ ...campaign, name: e.target.value })
          }
        />

        <label>Subject</label>
        <input
          value={campaign.subject}
          onChange={(e) =>
            setCampaign({ ...campaign, subject: e.target.value })
          }
        />

        <label>Template</label>
        <select
          value={campaign.template_id}
          onChange={(e) =>
            setCampaign({ ...campaign, template_id: e.target.value })
          }
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <label>Audience Segment</label>
        <select
          value={campaign.segment_id}
          onChange={(e) =>
            setCampaign({ ...campaign, segment_id: e.target.value })
          }
        >
          {segments.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* ACTIONS */}
      <div className="campaign-edit-footer">
        <button
          className="em-btn-ghost"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
        <button
          className="em-btn-primary"
          disabled={saving}
          onClick={save}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {error && <div className="em-card em-badge-danger">{error}</div>}
    </div>
  );
}
