import useSubscribers from "../hooks/useSubscribers";

export default function SubscriberFilters() {
  const { setFilters } = useSubscribers();

  return (
    <div className="flex gap-4">
      <input
        placeholder="Search email…"
        className="bg-black/40 px-3 py-2 rounded-lg border border-white/10"
        onChange={(e) =>
          setFilters((f) => ({ ...f, search: e.target.value }))
        }
      />
      <select
        className="bg-black/40 px-3 py-2 rounded-lg border border-white/10"
        onChange={(e) =>
          setFilters((f) => ({ ...f, status: e.target.value || null }))
        }
      >
        <option value="">All</option>
        <option value="active">Active</option>
        <option value="unsubscribed">Unsubscribed</option>
        <option value="blocked">Blocked</option>
      </select>
    </div>
  );
}
