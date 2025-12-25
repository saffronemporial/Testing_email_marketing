export default function AIPromptBuilder({ onChange }) {
  return (
    <div className="email-card p-5 space-y-3">
      <h3 className="text-[#d4af37] font-semibold">
        Prompt Builder
      </h3>

      <input
        placeholder="Campaign goal (e.g. promote new product)"
        className="bg-black/40 p-2 rounded w-full"
        onChange={e => onChange(p => ({ ...p, goal: e.target.value }))}
      />

      <select
        className="bg-black/40 p-2 rounded w-full"
        onChange={e => onChange(p => ({ ...p, tone: e.target.value }))}
      >
        <option value="professional">Professional</option>
        <option value="premium">Premium</option>
        <option value="urgent">Urgent</option>
      </select>

      <textarea
        rows={4}
        placeholder="Additional instructions"
        className="bg-black/40 p-2 rounded w-full"
        onChange={e =>
          onChange(p => ({ ...p, instructions: e.target.value }))
        }
      />
    </div>
  );
}
