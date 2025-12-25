import { useState } from "react";
import { supabase } from "../../../supabaseClient";
import { createCampaign } from "../services/campaign.service";

export default function ApprovalPreview({ draft, onAction }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const approve = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Mark draft approved
      const { error: updErr } = await supabase
        .from("ai_email_drafts")
        .update({ status: "approved" })
        .eq("id", draft.id);

      if (updErr) throw updErr;

      // 2. Convert to campaign
      await createCampaign({
        title: `AI: ${draft.generated_subject}`,
        subject: draft.generated_subject,
        content_html: draft.generated_html,
        ai_generated: true,
        ai_model: "gemini",
        ai_prompt: draft.generated_text,
      });

      onAction();
    } catch (e) {
      console.error(e);
      setError("Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const reject = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("ai_email_drafts")
        .update({ status: "rejected" })
        .eq("id", draft.id);

      if (error) throw error;
      onAction();
    } catch (e) {
      setError("Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-card p-5">
      <h3 className="text-[#d4af37] font-semibold mb-2">
        Draft Preview
      </h3>

      <div className="text-sm text-gray-400 mb-2">
        Subject: {draft.generated_subject}
      </div>

      <iframe
        title="Draft Preview"
        className="w-full h-[400px] rounded bg-white mb-4"
        srcDoc={draft.generated_html}
      />

      {error && <p className="text-red-400 mb-2">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button
          onClick={reject}
          disabled={loading}
          className="px-4 py-2 rounded bg-red-500/20 text-red-300"
        >
          Reject
        </button>
        <button
          onClick={approve}
          disabled={loading}
          className="email-btn-primary"
        >
          {loading ? "Processing…" : "Approve & Create Campaign"}
        </button>
      </div>
    </div>
  );
}
