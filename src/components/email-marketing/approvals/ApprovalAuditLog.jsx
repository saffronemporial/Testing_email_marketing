import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function ApprovalAuditLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    supabase
      .from("ai_email_drafts")
      .select("generated_subject, status, created_at")
      .neq("status", "generated")
      .order("created_at", { ascending: false })
      .then(({ data }) => setLogs(data || []));
  }, []);

  return (
    <div className="email-card p-5">
      <h3 className="text-[#d4af37] font-semibold mb-3">
        Approval Audit Log
      </h3>

      <ul className="space-y-2 max-h-[300px] overflow-y-auto">
        {logs.map((l, i) => (
          <li
            key={i}
            className="bg-black/40 p-3 rounded flex justify-between"
          >
            <span className="text-sm">
              {l.generated_subject}
            </span>
            <span
              className={`text-xs ${
                l.status === "approved"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {l.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
