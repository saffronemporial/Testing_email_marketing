import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function EmailProviderManager() {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    supabase
      .from("email_providers")
      .select("*")
      .order("priority")
      .then(({ data }) => setProviders(data || []));
  }, []);

  const updateProvider = (id, key, value) => {
    setProviders(p =>
      p.map(pr => (pr.id === id ? { ...pr, [key]: value } : pr))
    );
  };

  const saveProvider = async (provider) => {
    await supabase
      .from("email_providers")
      .update(provider)
      .eq("id", provider.id);
  };

  return (
    <div className="email-card space-y-4">
      <h3 className="text-[#d4af37]">Email Providers & Failover</h3>

      {providers.map(p => (
        <div
          key={p.id}
          className="border border-white/10 rounded-lg p-4"
        >
          <div className="flex justify-between">
            <strong>{p.provider_name}</strong>
            <span className="text-xs text-gray-400">
              Priority {p.priority}
            </span>
          </div>

          <label className="block mt-2">
            <input
              type="checkbox"
              checked={p.enabled}
              onChange={e =>
                updateProvider(p.id, "enabled", e.target.checked)
              }
            />{" "}
            Enabled
          </label>

          <label className="block mt-2 text-sm">
            From Email
          </label>
          <input
            className="bg-black/40 p-2 rounded w-full"
            value={p.from_email}
            onChange={e =>
              updateProvider(p.id, "from_email", e.target.value)
            }
          />

          <button
            onClick={() => saveProvider(p)}
            className="email-btn-secondary mt-3"
          >
            Save Provider
          </button>
        </div>
      ))}
    </div>
  );
}
