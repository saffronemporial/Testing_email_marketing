export default function AIDraftPreview({ subject, html }) {
  return (
    <div className="email-card p-5">
      <h3 className="text-[#d4af37] mb-2 font-semibold">
        AI Draft Preview
      </h3>

      <div className="text-sm text-gray-400 mb-2">
        Subject: {subject}
      </div>

      <iframe
        title="AI Draft Preview"
        className="w-full h-[500px] rounded bg-white"
        srcDoc={html}
      />
    </div>
  );
}
