// src/hooks/useFinanceDashboard.js
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

/**
 * Hook to compute high-level finance KPIs for a given period.
 * By default, uses the current calendar month.
 *
 * Returns:
 * {
 *   summary: {
 *     totalProfit,
 *     avgMargin,
 *     ordersCount,
 *   },
 *   loading,
 *   error
 * }
 */
export function useFinanceDashboard({ startDate, endDate } = {}) {
  const [summary, setSummary] = useState({
    totalProfit: 0,
    avgMargin: null,
    ordersCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        let fromISO;
        let toISO;

        if (startDate) {
          const fromDate = new Date(startDate);
          fromISO = fromDate.toISOString();
        } else {
          const now = new Date();
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          fromISO = firstDay.toISOString();
        }

        if (endDate) {
          const toDate = new Date(endDate);
          toDate.setHours(23, 59, 59, 999);
          toISO = toDate.toISOString();
        } else {
          const now = new Date();
          now.setHours(23, 59, 59, 999);
          toISO = now.toISOString();
        }

        let query = supabase
          .from("export_orders")
          .select(
            "id, total_order_value, total_cost, profit_amount, profit_margin, created_at"
          )
          .gte("created_at", fromISO)
          .lte("created_at", toISO);

        const { data, error: err } = await query;
        if (err) throw err;

        const rows = data || [];
        if (!rows.length) {
          setSummary({
            totalProfit: 0,
            avgMargin: null,
            ordersCount: 0,
          });
          return;
        }

        const totalProfit = rows.reduce(
          (sum, r) => sum + Number(r.profit_amount || 0),
          0
        );
        const avgMargin =
          rows.reduce(
            (sum, r) => sum + (Number(r.profit_margin || 0) || 0),
            0
          ) / rows.length;

        setSummary({
          totalProfit,
          avgMargin,
          ordersCount: rows.length,
        });
      } catch (err) {
        console.error("useFinanceDashboard error:", err);
        setError(err.message || "Failed to load finance dashboard summary.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [startDate, endDate]);

  return { summary, loading, error };
}
