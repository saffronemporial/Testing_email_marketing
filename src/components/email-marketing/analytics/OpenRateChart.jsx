export default function OpenRateChart({ logs }) {
  const opened = logs.filter(l => l.status === "opened");

  return (
    <div className="email-card p-5">
      <h3 className="text-[#d4af37] font-semibold mb-3">
        Opens Timeline
      </h3>

      {opened.length === 0 && (
        <p className="text-gray-400 text-sm">
          No open events recorded.
        </p>
      )}

      <ul className="space-y-2 max-h-[250px] overflow-y-auto">
        {opened.map((o, i) => (
          <li
            key={i}
            className="bg-black/40 p-2 rounded text-xs"
          >
            Opened at {new Date(o.sent_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
