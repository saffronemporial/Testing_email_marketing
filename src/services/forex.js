export async function fetchForexINRtoAED() {
  try {
    const res = await fetch('https://api.exchangerate.host/latest?base=INR&symbols=AED');
    const j = await res.json();
    if (j && j.rates && j.rates.AED) return { rate: j.rates.AED };
  } catch (e) {
    console.warn('Forex fetch failed', e);
  }
  return { rate: null };
}

export function convertInrToAedWithMargin(inrPrice, rate, marginPct=5) {
  if (!rate) return null;
  const rawAed = Number(inrPrice) * Number(rate);
  const marginMultiplier = 1 + Number(marginPct) / 100.0;
  return Number((rawAed * marginMultiplier).toFixed(4));
}
