import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";

const VARIABLE_TYPES = [
  "text",
  "number",
  "currency",
  "url",
  "country",
  "date"
];

export default function TemplateVariablesEditor({ templateId }) {
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------
     LOAD VARIABLES
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("template_variables")
        .select("*")
        .eq("template_id", templateId)
        .order("created_at");

      if (!mounted) return;

      if (error) {
        setError("Failed to load template variables");
      } else {
        setVariables(data || []);
      }
      setLoading(false);
    };

    load();
    return () => (mounted = false);
  }, [templateId]);

  /* -------------------------------------------------------
     CRUD
  -------------------------------------------------------- */
  const addVariable = () => {
    setVariables([
      ...variables,
      {
        id: crypto.randomUUID(),
        key: "",
        type: "text",
        required: false,
        default_value: "",
        ai_hint: "",
        locked: false,
        isNew: true
      }
    ]);
  };

  const updateVariable = (id, patch) => {
    setVariables(
      variables.map((v) =>
        v.id === id ? { ...v, ...patch } : v
      )
    );
  };

  const saveVariable = async (v) => {
    if (!v.key) {
      setError("Variable key is required");
      return;
    }

    const payload = {
      template_id: templateId,
      key: v.key,
      type: v.type,
      required: v.required,
      default_value: v.default_value,
      ai_hint: v.ai_hint,
      locked: v.locked
    };

    if (v.isNew) {
      await supabase.from("template_variables").insert(payload);
    } else {
      await supabase
        .from("template_variables")
        .update(payload)
        .eq("id", v.id);
    }
  };

  const removeVariable = async (v) => {
    if (!v.isNew) {
      await supabase
        .from("template_variables")
        .delete()
        .eq("id", v.id);
    }
    setVariables(variables.filter((x) => x.id !== v.id));
  };

  if (loading) return <div className="em-card">Loading variables…</div>;
  if (error) return <div className="em-card em-badge-danger">{error}</div>;

  return (
    <div className="em-fade-up variables-root">

      {/* HEADER */}
      <div className="variables-header">
        <h3>Template Variables</h3>
        <span className="em-muted">
          Control personalization & AI behavior
        </span>
      </div>

      {/* VARIABLES */}
      <div className="variables-grid">
        {variables.map((v) => (
          <div key={v.id} className="em-card variable-card">
            <input
              placeholder="variable_key"
              value={v.key}
              disabled={v.locked}
              onChange={(e) =>
                updateVariable(v.id, { key: e.target.value })
              }
            />

            <select
              value={v.type}
              disabled={v.locked}
              onChange={(e) =>
                updateVariable(v.id, { type: e.target.value })
              }
            >
              {VARIABLE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <textarea
              placeholder="AI usage hint (optional)"
              value={v.ai_hint}
              onChange={(e) =>
                updateVariable(v.id, { ai_hint: e.target.value })
              }
            />

            <div className="variable-flags">
              <label>
                <input
                  type="checkbox"
                  checked={v.required}
                  onChange={(e) =>
                    updateVariable(v.id, { required: e.target.checked })
                  }
                />
                Required
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={v.locked}
                  onChange={(e) =>
                    updateVariable(v.id, { locked: e.target.checked })
                  }
                />
                Lock
              </label>
            </div>

            <div className="variable-actions">
              <button
                className="em-btn-ghost"
                onClick={() => saveVariable(v)}
              >
                Save
              </button>
              <button
                className="em-btn-ghost danger"
                onClick={() => removeVariable(v)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD */}
      <button className="em-btn-primary" onClick={addVariable}>
        + Add Variable
      </button>

    </div>
  );
}
