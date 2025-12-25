import { useState } from "react";

export default function AIDraftGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/functions/v1/generate-ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("AI generation failed");
      alert("Draft generated and sent for admin approval.");
      setPrompt("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-card p-6 space-y-4">
      <h2 className="text-[#d4af37] text-lg">Generate AI Draft</h2>

      <textarea
        rows={5}
        placeholder="Describe the email you want AI to generate…"
        className="w-full bg-black/40 p-3 rounded"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />

      {error && <p className="text-red-400">{error}</p>}

      <button
        disabled={loading || !prompt}
        onClick={generate}
        className="email-btn-primary"
      >
        {loading ? "Generating…" : "Generate Draft"}
      </button>
    </div>
  );
}
