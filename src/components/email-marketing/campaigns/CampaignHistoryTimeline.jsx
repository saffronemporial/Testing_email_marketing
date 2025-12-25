import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function CampaignHistoryTimeline({ campaignId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    supabase
      .from("email_logs")
      .select("status, email, sent_at")
      .eq("campaign_id", campaignId)
      .order("sent_at", { ascending: false })
      .then(({ data }) => setLogs(data || []));
  }, [campaignId]);

  return (
    <div className="email-card p-6">
      <h3 className="text-[#d4af37] mb-4 font-semibold">
        Delivery Timeline
      </h3>

      {logs.length === 0 && (
        <p className="text-gray-400 text-sm">
          No delivery events recorded yet.
        </p>
      )}

      <ul className="space-y-2 max-h-[300px] overflow-y-auto">
        {logs.map((l, i) => (
          <li
            key={i}
            className="flex justify-between bg-black/40 p-3 rounded"
          >
            <span className="text-xs text-gray-400">
              {new Date(l.sent_at).toLocaleString()}
            </span>
            <span className="text-sm">{l.email}</span>
            <span
              className={
                l.status === "sent"
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {l.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
