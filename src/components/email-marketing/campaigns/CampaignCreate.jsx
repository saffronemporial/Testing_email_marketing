import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import CampaignAudienceSelector from "./CampaignAudienceSelector";
import TemplateBuilderDnD from "../templates/TemplatePreview";
import "../styles/emailMarketing.css";
import "./campaignCreate.css";

export default function CampaignCreate() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [system, setSystem] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [segments, setSegments] = useState([]);

  const [form, setForm] = useState({
    name: "",
    subject: "",
    template_id: "",
    segment_id: "",
    status: "draft"
  });

  const [estimate, setEstimate] = useState(null);
  const [previewBlocks, setPreviewBlocks] = useState([]);

  /* -------------------------------------------------------
     LOAD GOVERNANCE DATA
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [{ data: sys }, { data: tpls }, { data: segs }] =
          await Promise.all([
            supabase.from("email_system_settings").select("*").single(),
            supabase
              .from("email_templates")
              .select("id, name, blocks, status")
              .eq("status", "approved"),
            supabase
              .from("recipient_segments")
              .select("id, name, estimated_count")
          ]);

        if (!mounted) return;
        setSystem(sys);
        setTemplates(tpls || []);
        setSegments(segs || []);
      } catch (e) {
        setError("Failed to load campaign prerequisites");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  /* -------------------------------------------------------
     RECIPIENT ESTIMATION (REAL)
  -------------------------------------------------------- */
  useEffect(() => {
    if (!form.segment_id) return;

    const seg = segments.find(s => s.id === form.segment_id);
    if (!seg) return;

    const deliverable = Math.max(
      0,
      (seg.estimated_count || 0) -
        (system?.suppressed_estimate_hint || 0)
    );

    setEstimate({
      total: seg.estimated_count,
      deliverable,
      exceedsDaily:
        system?.daily_limit && deliverable > system.daily_limit
    });
  }, [form.segment_id, segments, system]);

  /* -------------------------------------------------------
     TEMPLATE PREVIEW
  -------------------------------------------------------- */
  useEffect(() => {
    const tpl = templates.find(t => t.id === form.template_id);
    setPreviewBlocks(tpl?.blocks || []);
  }, [form.template_id, templates]);

  /* -------------------------------------------------------
     VALIDATION
  -------------------------------------------------------- */
  const validationErrors = useMemo(() => {
    const errs = [];
    if (!form.name.trim()) errs.push("Campaign name is required");
    if (!form.subject.trim()) errs.push("Subject is required");
    if (!form.template_id) errs.push("Template must be selected");
    if (!form.segment_id) errs.push("Recipient segment must be selected");
    if (!system?.global_email_enabled)
      errs.push("Global email sending is paused");
    return errs;
  }, [form, system]);

  /* -------------------------------------------------------
     ACTIONS
  -------------------------------------------------------- */
  const saveDraft = async () => {
    if (validationErrors.length) {
      setError(validationErrors[0]);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("email_campaigns")
        .insert({
          name: form.name,
          subject: form.subject,
          template_id: form.template_id,
          segment_id: form.segment_id,
          status: "draft"
        })
        .select()
        .single();

      if (error) throw error;
      navigate(`/admin/email-marketing/campaigns/${data.id}`);
    } catch (e) {
      setError("Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  const submitForApproval = async () => {
    if (validationErrors.length) {
      setError(validationErrors[0]);
      return;
    }

    setSaving(true);
    try {
      await supabase.from("email_campaigns").insert({
        name: form.name,
        subject: form.subject,
        template_id: form.template_id,
        segment_id: form.segment_id,
        status: "pending_approval"
      });

      navigate("/admin/email-marketing/campaigns");
    } catch {
      setError("Failed to submit for approval");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="em-card">Loading…</div>;
  if (error) return <div className="em-card em-badge-danger">{error}</div>;

  return (
    <div className="em-fade-up campaign-create-root">

      {/* ================= HEADER ================= */}
      <div className="campaign-create-header">
        <h2>Create Campaign</h2>
        <span className="em-muted">
          Governed campaign composition
        </span>
      </div>

      {/* added manually */}
         <CampaignAudienceSelector
           campaignId={campaign.id}
           segmentId={campaign.segment_id}
         />
        <TemplateBuilderDnD />
      {/* ================= FORM ================= */}
      <div className="campaign-create-grid">

        <div className="em-card">
          <label>Campaign Name</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <label>Subject</label>
          <input
            value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
          />

          <label>Template</label>
          <select
            value={form.template_id}
            onChange={e =>
              setForm({ ...form, template_id: e.target.value })
            }
          >
            <option value="">Select template</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <label>Recipient Segment</label>
          <select
            value={form.segment_id}
            onChange={e =>
              setForm({ ...form, segment_id: e.target.value })
            }
          >
            <option value="">Select segment</option>
            {segments.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* ================= PREVIEW ================= */}
        <div className="em-card preview-card">
          <h3>Email Preview</h3>
          <div className="email-preview">
            {previewBlocks.map((b, i) => (
              <PreviewBlock key={i} block={b} />
            ))}
          </div>
        </div>

      </div>

      {/* ================= ESTIMATION ================= */}
      {estimate && (
        <div className={`em-card ${estimate.exceedsDaily ? "em-badge-warning" : ""}`}>
          <strong>Recipients:</strong> {estimate.deliverable} deliverable
          {estimate.exceedsDaily && (
            <p className="em-muted">
              Warning: exceeds daily sending limit
            </p>
          )}
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <div className="campaign-create-footer">
        <button className="em-btn-ghost" onClick={saveDraft} disabled={saving}>
          Save Draft
        </button>
        <button className="em-btn-primary" onClick={submitForApproval} disabled={saving}>
          Submit for Approval
        </button>
      </div>

    </div>
  );
}

function PreviewBlock({ block }) {
  if (block.type === "header") return <h1>{block.props.text}</h1>;
  if (block.type === "text") return <p>{block.props.text}</p>;
  if (block.type === "button")
    return <a className="email-btn">{block.props.label}</a>;
  return null;
}