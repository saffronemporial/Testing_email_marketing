export default function SubscriberTagsEditor({ tags = [], onChange }) {
  const addTag = tag =>
    onChange([...new Set([...tags, tag.toLowerCase()])]);

  const remove = tag =>
    onChange(tags.filter(t => t !== tag));

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-2">
        {tags.map(t => (
          <span
            key={t}
            className="email-stat-badge cursor-pointer"
            onClick={() => remove(t)}
          >
            {t} ✕
          </span>
        ))}
      </div>

      <input
        placeholder="Add tag"
        onKeyDown={e => {
          if (e.key === "Enter") {
            addTag(e.target.value);
            e.target.value = "";
          }
        }}
        className="bg-black/40 p-2 rounded"
      />
    </div>
  );
}
