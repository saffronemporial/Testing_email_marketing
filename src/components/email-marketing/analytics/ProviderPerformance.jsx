export default function ProviderPerformance({ providers }) {
  const summary = providers.reduce((acc, p) => {
    acc[p.provider] = acc[p.provider] || { sent: 0, failed: 0 };
    if (p.status === "sent") acc[p.provider].sent += 1;
    else acc[p.provider].failed += 1;
    return acc;
  }, {});

  return (
    <div className="email-card p-5">
      <h3 className="text-[#d4af37] font-semibold mb-3">
        Provider Performance
      </h3>

      {Object.keys(summary).length === 0 && (
        <p className="text-gray-400 text-sm">
          No provider data available.
        </p>
      )}

      <ul className="space-y-2">
        {Object.entries(summary).map(([provider, s]) => (
          <li
            key={provider}
            className="flex justify-between bg-black/40 p-3 rounded"
          >
            <span>{provider}</span>
            <span className="text-sm">
              <span className="text-green-400">{s.sent}</span> /
              <span className="text-red-400"> {s.failed}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
