// src/hooks/useProfitTrends.js
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { toNumberSafe } from "../utils/financeCalculations";

/**
 * Hook to compute profit & margin trends over time (monthly).
 *
 * Returns:
 * {
 *   profitByMonth: { [YYYY-MM]: totalProfit },
 *   marginByMonth: { [YYYY-MM]: avgMargin },
 *   rawRows,
 *   loading,
 *   error
 * }
 */
export function useProfitTrends({ startDate, endDate } = {}) {
  const [profitByMonth, setProfitByMonth] = useState({});
  const [marginByMonth, setMarginByMonth] = useState({});
  const [rawRows, setRawRows] = useState([]);
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
          const lastYear = new Date(now);
          lastYear.setMonth(now.getMonth() - 11);
          lastYear.setDate(1);
          fromISO = lastYear.toISOString();
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

        const { data, error: err } = await supabase
          .from("export_orders")
          .select(
            "id, total_order_value, total_cost, profit_amount, profit_margin, created_at"
          )
          .gte("created_at", fromISO)
          .lte("created_at", toISO);

        if (err) throw err;

        const rows = data || [];
        setRawRows(rows);

        const pByMonth = {};
        const mSumByMonth = {};
        const countByMonth = {};

        for (const row of rows) {
          if (!row.created_at) continue;
          const d = new Date(row.created_at);
          if (Number.isNaN(d.getTime())) continue;

          const key = d.toISOString().slice(0, 7); // YYYY-MM
          const profit = toNumberSafe(row.profit_amount);
          const margin = toNumberSafe(row.profit_margin);

          pByMonth[key] = (pByMonth[key] || 0) + profit;
          mSumByMonth[key] = (mSumByMonth[key] || 0) + margin;
          countByMonth[key] = (countByMonth[key] || 0) + 1;
        }

        const mAvgByMonth = {};
        Object.keys(mSumByMonth).forEach((key) => {
          const count = countByMonth[key] || 1;
          mAvgByMonth[key] = mSumByMonth[key] / count;
        });

        setProfitByMonth(pByMonth);
        setMarginByMonth(mAvgByMonth);
      } catch (err) {
        console.error("useProfitTrends error:", err);
        setError(err.message || "Failed to load profit trends.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [startDate, endDate]);

  return {
    profitByMonth,
    marginByMonth,
    rawRows,
    loading,
    error,
  };
}
