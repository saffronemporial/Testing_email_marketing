import { useEffect, useState } from "react";
import { fetchCampaigns } from "../services/campaign.service";
import CampaignSendNowModal from "./CampaignSendNowModal";

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [sendId, setSendId] = useState(null);

  useEffect(() => {
    fetchCampaigns().then(setCampaigns);
  }, []);

  return (
    <div className="email-card p-5">
      <div className="space-y-3">
        {campaigns.map(c => (
          <div
            key={c.id}
            className="flex justify-between items-center bg-black/40 p-4 rounded-lg"
          >
            <div>
              <div className="text-[#d4af37] font-semibold">
                {c.title}
              </div>
              <div className="text-xs text-gray-400">
                {c.subject}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="email-stat-badge">
                {c.status}
              </span>

              {c.status === "draft" && (
                <button
                  onClick={() => setSendId(c.id)}
                  className="email-btn-primary"
                >
                  Send Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {sendId && (
        <CampaignSendNowModal
          campaignId={sendId}
          onClose={() => setSendId(null)}
        />
      )}
    </div>
  );
}
