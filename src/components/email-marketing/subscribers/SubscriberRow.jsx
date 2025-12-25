export default function SubscriberRow({
  subscriber,
  selectedIds,
  setSelectedIds,
}) {
  const checked = selectedIds.includes(subscriber.id);

  return (
    <tr className="border-b border-white/5 hover:bg-white/5">
      <td>
        <input
          type="checkbox"
          checked={checked}
          onChange={() =>
            setSelectedIds((prev) =>
              checked
                ? prev.filter((id) => id !== subscriber.id)
                : [...prev, subscriber.id]
            )
          }
        />
      </td>
      <td className="py-2">{subscriber.email}</td>
      <td className="email-stat-badge">{subscriber.status}</td>
      <td>{subscriber.source}</td>
      <td>{new Date(subscriber.created_at).toLocaleDateString()}</td>
    </tr>
  );
}
