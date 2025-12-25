import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function useEmailAnalytics(campaignId) {
  const [performance, setPerformance] = useState(null);
  const [logs, setLogs] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!campaignId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [{ data: perf }, { data: logData }, { data: provData }] =
          await Promise.all([
            supabase
              .from("campaign_performance")
              .select("*")
              .eq("id", campaignId)
              .single(),

            supabase
              .from("email_logs")
              .select("status, sent_at, provider")
              .eq("campaign_id", campaignId),

            supabase
              .from("provider_logs")
              .select("provider, status")
              .eq("campaign_id", campaignId),
          ]);

        setPerformance(perf);
        setLogs(logData || []);
        setProviders(provData || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [campaignId]);

  return { performance, logs, providers, loading, error };
}
