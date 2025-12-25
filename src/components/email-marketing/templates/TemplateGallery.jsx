import { useEffect, useState } from "react";
import { fetchTemplates } from "../services/template.service";
import TemplateCategoryFilter from "./TemplateCategoryFilter";

export default function TemplateGallery() {
  const [templates, setTemplates] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates({ categoryId })
      .then(setTemplates)
      .catch(() => setError("Failed to load templates"));
  }, [categoryId]);

  return (
    <div className="email-card p-5">
      <TemplateCategoryFilter onChange={setCategoryId} />

      {error && <p className="text-red-400 mt-2">{error}</p>}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        {templates.map(t => (
          <div
            key={t.id}
            className="email-card-hover email-card p-4 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>{t.template_categories?.icon}</span>
              <h3 className="text-[#d4af37] font-semibold">
                {t.name}
              </h3>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Version {t.version}
            </p>

            <div
              className="mt-4 text-xs"
              style={{ color: t.template_categories?.color }}
            >
              {t.template_categories?.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
