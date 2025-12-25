export default function ClickRateChart({ logs }) {
  const clicks = logs.filter(l => l.status === "clicked");

  return (
    <div className="email-card p-5">
      <h3 className="text-[#d4af37] font-semibold mb-3">
        Click Activity
      </h3>

      {clicks.length === 0 && (
        <p className="text-gray-400 text-sm">
          No click events recorded.
        </p>
      )}

      <ul className="space-y-2 max-h-[250px] overflow-y-auto">
        {clicks.map((c, i) => (
          <li
            key={i}
            className="bg-black/40 p-2 rounded text-xs"
          >
            Clicked at {new Date(c.sent_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
