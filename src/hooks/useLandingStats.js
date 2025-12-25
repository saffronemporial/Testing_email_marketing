// src/hooks/useLandingStats.js
import { useEffect, useState } from 'react';
// 🔁 Adjust this path to match your existing Supabase client file
import { supabase } from '../supabaseClient';

const initialState = {
  loading: true,
  error: null,
  activeClients: 0,
  liveShipments: 0,
  exportOrdersThisMonth: 0,
};

export function useLandingStats(refreshMs = 60000) {
  const [stats, setStats] = useState(initialState);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        // --- Active client profiles ---
        const { count: activeClients, error: clientsError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('user_type', 'client');

        if (clientsError) throw clientsError;

        // --- Live shipments (in transit / loading / customs / shipped) ---
        const { count: liveShipments, error: shipmentsError } = await supabase
          .from('shipments')
          .select('id', { count: 'exact', head: true })
          .in('status', ['in_transit', 'loading', 'customs', 'shipped']);

        if (shipmentsError) throw shipmentsError;

        // --- Export orders created this month ---
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const { count: exportOrdersThisMonth, error: ordersError } =
          await supabase
            .from('export_orders')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', startOfMonth.toISOString());

        if (ordersError) throw ordersError;

        if (!cancelled) {
          setStats({
            loading: false,
            error: null,
            activeClients: activeClients || 0,
            liveShipments: liveShipments || 0,
            exportOrdersThisMonth: exportOrdersThisMonth || 0,
          });
        }
      } catch (err) {
        console.error('[useLandingStats] Failed to load stats', err);
        if (!cancelled) {
          setStats((prev) => ({
            ...prev,
            loading: false,
            error: err.message || 'Unknown error',
          }));
        }
      }
    };

    loadStats();

    // Optional: auto-refresh every X ms (default 60s)
    const interval = setInterval(loadStats, refreshMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refreshMs]);

  return stats;
}
