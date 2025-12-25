import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function ComplianceAndLimits() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    supabase
      .from("email_compliance_settings")
      .select("*")
      .single()
      .then(({ data }) => setConfig(data));
  }, []);

  if (!config) return null;

  const update = (k, v) =>
    setConfig(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    await supabase
      .from("email_compliance_settings")
      .update(config)
      .eq("id", config.id);
  };

  return (
    <div className="email-card space-y-4">
      <h3 className="text-[#d4af37]">Compliance & Limits</h3>

      <label className="block">
        <input
          type="checkbox"
          checked={config.require_unsubscribe}
          onChange={e =>
            update("require_unsubscribe", e.target.checked)
          }
        />{" "}
        Enforce unsubscribe link in all emails
      </label>

      <label className="block">
        <input
          type="checkbox"
          checked={config.block_unverified_domains}
          onChange={e =>
            update("block_unverified_domains", e.target.checked)
          }
        />{" "}
        Block sending from unverified domains
      </label>

      <label className="block text-sm">
        Max emails per hour (global)
      </label>
      <input
        type="number"
        className="bg-black/40 p-2 rounded w-full"
        value={config.max_per_hour}
        onChange={e =>
          update("max_per_hour", Number(e.target.value))
        }
      />

      <label className="block text-sm">
        Max emails per campaign
      </label>
      <input
        type="number"
        className="bg-black/40 p-2 rounded w-full"
        value={config.max_per_campaign}
        onChange={e =>
          update("max_per_campaign", Number(e.target.value))
        }
      />

      <button onClick={save} className="email-btn-primary">
        Save Compliance Rules
      </button>
    </div>
  );
}
