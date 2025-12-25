export default function ScheduleCalendar({ campaigns }) {
  return (
    <div className="email-card p-5">
      <h3 className="text-[#d4af37] font-semibold mb-3">
        Upcoming Sends
      </h3>

      {campaigns.length === 0 && (
        <p className="text-gray-400 text-sm">
          No campaigns currently scheduled.
        </p>
      )}

      <ul className="space-y-2">
        {campaigns.map(c => (
          <li
            key={c.id}
            className="bg-black/40 p-3 rounded flex justify-between"
          >
            <span className="text-sm">
              {c.title}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(c.scheduled_at).toLocaleString()} ({c.scheduled_timezone})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
