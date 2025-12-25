import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function AIGenerationHistory() {
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    supabase
      .from("ai_email_drafts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setDrafts(data || []));
  }, []);

  return (
    <div className="email-card p-5">
      <h3 className="text-[#d4af37] font-semibold mb-3">
        Draft History
      </h3>

      <ul className="space-y-2">
        {drafts.map(d => (
          <li
            key={d.id}
            className="bg-black/40 p-3 rounded flex justify-between"
          >
            <span className="text-sm">
              {d.generated_subject}
            </span>
            <span className="text-xs text-gray-400">
              {d.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
