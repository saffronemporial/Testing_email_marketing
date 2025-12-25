import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import ApprovalPreview from "./ApprovalPreview";

export default function ApprovalInbox() {
  const [drafts, setDrafts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_email_drafts")
        .select("*")
        .eq("status", "generated")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (e) {
      setError("Failed to load approval inbox");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#d4af37]">
        Approval Inbox
      </h1>

      {error && <p className="text-red-400">{error}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="email-card p-5">
          <h3 className="text-[#d4af37] font-semibold mb-3">
            Pending Drafts
          </h3>

          {drafts.length === 0 && (
            <p className="text-gray-400 text-sm">
              No drafts awaiting approval.
            </p>
          )}

          <ul className="space-y-2">
            {drafts.map(d => (
              <li
                key={d.id}
                onClick={() => setSelected(d)}
                className="
                  bg-black/40 p-3 rounded cursor-pointer
                  hover:bg-white/5 transition
                "
              >
                <div className="text-sm">{d.generated_subject}</div>
                <div className="text-xs text-gray-400">
                  {new Date(d.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {selected && (
          <ApprovalPreview
            draft={selected}
            onAction={() => {
              setSelected(null);
              load();
            }}
          />
        )}
      </div>
    </div>
  );
}
