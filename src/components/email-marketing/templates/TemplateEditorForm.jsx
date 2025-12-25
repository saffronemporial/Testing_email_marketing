// src/components/email-marketing/templates/TemplateEditorForm.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import TemplatePreview from "./TemplatePreview";
import TemplateVariablesEditor from "./TemplateVariablesEditor";
import "../styles/emailMarketing.css";


export default function TemplateEditorForm() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [template, setTemplate] = useState({
    name: "",
    subject: "",
    html_content: "",
    status: "draft"
  });

  /* -------------------------------------------------------
     LOAD TEMPLATE (EDIT MODE)
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadTemplate = async () => {
      if (!templateId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("email_templates")
          .select("name, subject, html_content, status")
          .eq("id", templateId)
          .single();

        if (error) throw error;

        if (mounted) setTemplate(data);
      } catch (err) {
        console.error("TemplateEditor load error:", err);
        setError("Failed to load template");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTemplate();
    return () => (mounted = false);
  }, [templateId]);

  /* -------------------------------------------------------
     SAVE TEMPLATE
  -------------------------------------------------------- */
  const saveTemplate = async () => {
    if (!template.name || !template.html_content) {
      setError("Template name and HTML are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (templateId) {
        await supabase
          .from("email_templates")
          .update(template)
          .eq("id", templateId);
      } else {
        await supabase.from("email_templates").insert(template);
      }

      navigate("/admin/email-marketing/templates");
    } catch (err) {
      console.error("Template save error:", err);
      setError("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="em-card">Loading template editor…</div>;
  }

  return (
    <div className="em-fade-up template-editor-wrap">

      {/* HEADER */}
      <div className="template-editor-header">
        <h2>{templateId ? "Edit Template" : "New Template"}</h2>

        <button
          className="em-btn-primary"
          onClick={saveTemplate}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Template"}
        </button>
      </div>

      {error && (
        <div className="em-card em-badge-danger">
          {error}
        </div>
      )}

      {/* EDITOR GRID */}
      <div className="template-editor-grid">
       <TemplateVariablesEditor templateId={template.id} />

        {/* LEFT */}
        <div className="em-card">
          <label>Template Name</label>
          <input
            value={template.name}
            onChange={(e) =>
              setTemplate({ ...template, name: e.target.value })
            }
          />

          <label>Subject Line</label>
          <input
            value={template.subject}
            onChange={(e) =>
              setTemplate({ ...template, subject: e.target.value })
            }
          />

          <label>Status</label>
          <select
            value={template.status}
            onChange={(e) =>
              setTemplate({ ...template, status: e.target.value })
            }
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
        </div>

        {/* RIGHT */}
        <div className="em-card">
          <label>Email HTML</label>
          <textarea
            rows={18}
            value={template.html_content}
            onChange={(e) =>
              setTemplate({
                ...template,
                html_content: e.target.value
              })
            }
          />
        </div>
        {/* PREVIEW */}
        <TemplatePreview
          blocks={template.blocks}
          variables={template.variables}
        />

      </div>
    </div>
  );
}
