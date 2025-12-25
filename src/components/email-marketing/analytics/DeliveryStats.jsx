export default function DeliveryStats({ logs }) {
  const sent = logs.filter(l => l.status === "sent").length;
  const failed = logs.filter(l => l.status === "failed").length;

  return (
    <div className="email-card p-5">
      <h3 className="text-[#d4af37] font-semibold mb-3">
        Delivery Stats
      </h3>

      <div className="flex gap-6">
        <div>
          <div className="text-xs text-gray-400">Sent</div>
          <div className="text-lg text-green-400">{sent}</div>
        </div>

        <div>
          <div className="text-xs text-gray-400">Failed</div>
          <div className="text-lg text-red-400">{failed}</div>
        </div>
      </div>
    </div>
  );
}
