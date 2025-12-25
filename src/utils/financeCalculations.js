// src/utils/financeCalculations.js

/**
 * Safely converts a value to number; falls back to 0 if invalid.
 */
export function toNumberSafe(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return num;
}

/**
 * Sum total cost from an array of export_costs or similar objects.
 * Prefers allocated_amount if present, otherwise amount.
 */
export function calculateTotalCost(costs = []) {
  if (!Array.isArray(costs)) return 0;
  return costs.reduce((sum, c) => {
    const amount =
      c && c.allocated_amount != null
        ? c.allocated_amount
        : c && c.amount != null
        ? c.amount
        : 0;
    return sum + toNumberSafe(amount);
  }, 0);
}

/**
 * Calculates profit (sellingPrice - totalCost).
 */
export function calculateProfit(sellingPrice, totalCost) {
  const s = toNumberSafe(sellingPrice);
  const c = toNumberSafe(totalCost);
  return s - c;
}

/**
 * Calculates margin percentage.
 * If selling price is zero or missing, returns null.
 */
export function calculateProfitMargin(sellingPrice, totalCost) {
  const s = toNumberSafe(sellingPrice);
  const c = toNumberSafe(totalCost);
  if (s === 0) return null;
  const profit = s - c;
  return (profit / s) * 100;
}

/**
 * Aggregates costs by category.
 * Returns an object: { [category]: totalAmount }
 */
export function calculateCostByCategory(costs = []) {
  const result = {};
  if (!Array.isArray(costs)) return result;

  for (const c of costs) {
    if (!c) continue;
    const cat = c.cost_category || "other";
    const amount =
      c.allocated_amount != null ? c.allocated_amount : c.amount || 0;
    if (!result[cat]) result[cat] = 0;
    result[cat] += toNumberSafe(amount);
  }
  return result;
}

/**
 * Calculates variance between estimated and actual.
 * Returns { varianceAmount, variancePercent }.
 * varianceAmount = actual - estimated.
 * variancePercent = (varianceAmount / estimated) * 100 (if estimated != 0).
 */
export function calculateVariance(estimated, actual) {
  const est = toNumberSafe(estimated);
  const act = toNumberSafe(actual);
  const varianceAmount = act - est;

  if (est === 0) {
    return {
      varianceAmount,
      variancePercent: null,
    };
  }

  const variancePercent = (varianceAmount / est) * 100;
  return {
    varianceAmount,
    variancePercent,
  };
}

/**
 * Aggregates costs by period: 'day' | 'month' | 'year'.
 * costDateField is the field name in each cost object containing ISO date string.
 * Returns: { [periodKey]: totalAmount }
 * e.g. periodKey = '2025-12' for month.
 */
export function aggregateCostsByPeriod(
  costs = [],
  period = "month",
  costDateField = "cost_date"
) {
  const result = {};
  if (!Array.isArray(costs)) return result;

  for (const c of costs) {
    if (!c) continue;
    const dateString = c[costDateField];
    if (!dateString) continue;

    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) continue;

    let key;
    switch (period) {
      case "day":
        key = d.toISOString().slice(0, 10); // YYYY-MM-DD
        break;
      case "year":
        key = d.getUTCFullYear().toString();
        break;
      case "month":
      default:
        key = d.toISOString().slice(0, 7); // YYYY-MM
        break;
    }

    const amount =
      c.allocated_amount != null ? c.allocated_amount : c.amount || 0;

    if (!result[key]) result[key] = 0;
    result[key] += toNumberSafe(amount);
  }

  return result;
}

/**
 * Formats a numeric amount into a currency string.
 * Defaults to INR style formatting.
 */
export function formatCurrency(amount, currency = "INR") {
  if (amount === null || amount === undefined) return "-";
  const value = toNumberSafe(amount);

  let symbol = "";
  if (currency === "INR") symbol = "₹";
  else if (currency === "USD") symbol = "$";
  else if (currency === "AED") symbol = "AED ";
  else if (currency === "EUR") symbol = "€";
  else symbol = `${currency} `;

  return (
    symbol +
    value.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })
  );
}
