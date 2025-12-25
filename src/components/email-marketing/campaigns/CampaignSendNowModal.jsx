import { sendNowCampaign } from "../services/campaign.service";
import { useState } from "react";

export default function CampaignSendNowModal({ campaignId, onClose }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const send = async () => {
    setSending(true);
    try {
      await sendNowCampaign(campaignId);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="email-card p-6 max-w-md">
        <h3 className="text-[#d4af37] text-lg mb-2">
          Confirm Send
        </h3>

        <p className="text-sm text-gray-300 mb-4">
          This action is irreversible. The campaign will be sent to
          all matching subscribers immediately.
        </p>

        {error && <p className="text-red-400">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-white/10"
          >
            Cancel
          </button>
          <button
            disabled={sending}
            onClick={send}
            className="email-btn-primary"
          >
            {sending ? "Sending…" : "Send Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
