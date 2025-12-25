// src/components/email-marketing/templates/TemplateDashboard.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import TemplateGallery from "./TemplateGallery";
import "../styles/emailMarketing.css";
import "./templateDashboard.css";

export default function TemplateDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [status, setStatus] = useState("all");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("email_templates")
          .select(
            "id, name, status, usage_count, updated_at"
          )
          .order("updated_at", { ascending: false });

        if (status !== "all") {
          query = query.eq("status", status);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (mounted) setTemplates(data || []);
      } catch (err) {
        console.error("TemplateDashboard error:", err);
        setError("Failed to load templates");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [status]);

  if (error) {
    return <div className="em-card em-badge-danger">{error}</div>;
  }

  return (
    <div className="em-fade-up">

      {/* HEADER */}
      <div className="template-dashboard-header">
        <h2>Email Templates</h2>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* GRID */}
      <div className="template-grid">
        {loading &&
          [...Array(6)].map((_, i) => (
            <div key={i} className="em-card skeleton" />
          ))}

        {!loading &&
          templates.map((t) => (
            <div
              key={t.id}
              className="em-card template-card"
            >
              <h3>{t.name}</h3>

              <div className="template-meta">
                <span className={`em-badge em-badge-${t.status === "active" ? "success" : "warning"}`}>
                  {t.status}
                </span>
                <span>{t.usage_count} uses</span>
              </div>

              <small>
                Updated{" "}
                {new Date(t.updated_at).toLocaleDateString()}
              </small>

              <button className="em-btn-primary">
                Edit Template
              </button>
            </div>
          ))}

          {/* below is added manually from old file imports, if crash app then remove below */}
               <div className="space-y-6">
               <h1 className="text-2xl font-semibold text-[#d4af37]">
                Email Templates
                </h1>

               <div className="email-card p-5 text-sm text-gray-300">
               Create reusable, brand-consistent email templates with variables,
               AI compatibility, and version control.
              </div>

               <TemplateGallery />
               </div>

      </div>
    </div>
  );
}
