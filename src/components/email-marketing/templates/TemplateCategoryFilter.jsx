import { useEffect, useState } from "react";
import { fetchCategories } from "../services/template.service";

export default function TemplateCategoryFilter({ onChange }) {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCats);
  }, []);

  return (
    <div className="flex gap-3 flex-wrap">
      <button
        onClick={() => onChange(null)}
        className="email-btn-primary"
      >
        All
      </button>

      {cats.map(c => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className="px-3 py-1 rounded-lg border border-white/10"
          style={{ color: c.color }}
        >
          {c.icon} {c.name}
        </button>
      ))}
    </div>
  );
}
