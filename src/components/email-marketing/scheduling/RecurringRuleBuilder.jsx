export default function RecurringRuleBuilder({ onChange }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm text-[#d4af37]">
        Recurring Schedule (Optional)
      </h4>

      <select
        className="bg-black/40 p-2 rounded w-full"
        onChange={e => {
          const v = e.target.value;
          if (!v) onChange(null);
          else
            onChange({
              frequency: v,
              interval: 1,
            });
        }}
      >
        <option value="">No recurrence</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
    </div>
  );
}
