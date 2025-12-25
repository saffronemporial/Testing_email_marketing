import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function TemplateVersionHistory({ templateId, onRestore }) {
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    supabase
      .from("email_templates")
      .select("*")
      .eq("parent_template_id", templateId)
      .order("version", { ascending: false })
      .then(({ data }) => setVersions(data || []));
  }, [templateId]);

  if (versions.length === 0) {
    return (
      <p className="text-gray-400 text-sm">
        No previous versions found.
      </p>
    );
  }

  return (
    <div className="email-card p-4">
      <h3 className="text-[#d4af37] font-semibold mb-3">
        Version History
      </h3>

      <ul className="space-y-2">
        {versions.map((v) => (
          <li
            key={v.id}
            className="flex justify-between items-center bg-black/40 p-3 rounded"
          >
            <span className="text-sm">
              Version {v.version} •{" "}
              {new Date(v.created_at).toLocaleString()}
            </span>

            <button
              onClick={() => onRestore(v)}
              className="email-btn-primary"
            >
              Restore
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
