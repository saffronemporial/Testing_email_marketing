// src/services/landingStatsService.js
// Central place for LandingPage data (trust score, shipments, markets, deals)

import { supabase } from '../supabaseClient';

// Helper
const avg = (arr) => (arr.length ? arr.reduce((s, n) => s + (n || 0), 0) / arr.length : 0);

export async function fetchLandingTrustStats() {
  try {
    // 1) Client intelligence
    const { data: intelligence, error: intelError } = await supabase
      .from('client_intelligence')
      .select('health_score, client_tier');

    if (intelError) console.warn('client_intelligence fetch warning', intelError);

    const { count: totalClients, error: clientErr } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true });

    if (clientErr) console.warn('clients count warning', clientErr);

    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // 2) Export orders for on-time performance
    const { data: exports, error: exErr } = await supabase
      .from('export_orders')
      .select('id, estimated_arrival, actual_arrival, amount_received')
      .gte('estimated_arrival', oneYearAgo.toISOString());

    if (exErr) console.warn('export_orders fetch warning', exErr);

    const healthScores = (intelligence || [])
      .map((r) => Number(r.health_score))
      .filter((n) => !Number.isNaN(n));

    const avgHealthScore = avg(healthScores); // 0–100 (as per your logic)

    const vipCount = (intelligence || []).filter((r) => r.client_tier === 'vip').length;
    const total = totalClients || 0;
    const vipRatio = total ? vipCount / total : 0;

    let onTimeCount = 0;
    let shipmentCount = 0;

    (exports || []).forEach((row) => {
      if (!row.estimated_arrival || !row.actual_arrival) return;
      shipmentCount += 1;
      const est = new Date(row.estimated_arrival);
      const act = new Date(row.actual_arrival);
      if (act <= est) onTimeCount += 1;
    });

    const onTimeRate = shipmentCount ? (onTimeCount / shipmentCount) : 0;

    // Composite Saffron Trust Score (0–100)
    const trustScore =
      Math.round(
        (0.5 * (avgHealthScore || 0)) +
        (0.3 * onTimeRate * 100) +
        (0.2 * vipRatio * 100)
      );

    return {
      success: true,
      trustScore,
      avgHealthScore: Math.round(avgHealthScore * 10) / 10,
      vipCount,
      totalClients: total,
      onTimeRate: Math.round(onTimeRate * 1000) / 10, // %
      shipmentCount,
      raw: { intelligence, exports },
    };
  } catch (err) {
    console.error('fetchLandingTrustStats fatal error', err);
    return { success: false, error: err.message };
  }
}

// ADD THIS FUNCTION into src/services/landingStatsService.js

export async function fetchLandingLiveStats() {
  try {
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // Run in parallel for speed
    const [
      clientsRes,
      shipmentsRes,
      exportsRes,
    ] = await Promise.all([
      // Total active clients (you can adjust filter if needed)
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true }),

      // Total shipments
      supabase
        .from('shipments')
        .select('id', { count: 'exact', head: true }),

      // Export value for last 12 months
      supabase
        .from('export_orders')
        .select('id, amount_received, port_of_discharge, created_at')
        .gte('created_at', oneYearAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000),
    ]);

    const clientCount = clientsRes?.count ?? 0;
    const shipmentCount = shipmentsRes?.count ?? 0;

    const exports = exportsRes?.data || [];
    const yearlyExportValue = exports.reduce(
      (sum, row) => sum + (Number(row.amount_received) || 0),
      0
    );

    const marketsSet = new Set(
      exports
        .map((row) => (row.port_of_discharge || '').trim())
        .filter(Boolean)
    );
    const activeMarkets = marketsSet.size;

    return {
      success: true,
      clientCount,
      shipmentCount,
      yearlyExportValue,
      shipmentsRes,
      activeMarkets,
    };
  } catch (err) {
    console.error('fetchLandingLiveStats fatal error', err);
    // Safe fallback so UI still shows something
    return {
      success: false,
      clientCount: 0,
      shipmentCount: 0,
      yearlyExportValue: 0,
      activeMarkets: 0,
      error: err.message,
    };
  }
}



export async function fetchPublicShipmentTimeline() {
  try {
    // Real export_orders timeline
    const { data, error } = await supabase
      .from('export_orders')
      .select('id, export_reference, port_of_discharge, estimated_departure, estimated_arrival, actual_departure, actual_arrival, amount_received')
      .order('estimated_departure', { ascending: true })
      .limit(40);

    if (error) {
      console.warn('export_orders timeline warning', error);
    }

    const realEvents = (data || []).map((row) => ({
      id: row.id,
      type: 'real',
      reference: row.export_reference || 'Export Shipment',
      port: row.port_of_discharge || 'N/A',
      estimatedDeparture: row.estimated_departure,
      estimatedArrival: row.estimated_arrival,
      actualDeparture: row.actual_departure,
      actualArrival: row.actual_arrival,
      amount: row.amount_received,
    }));

    // Light-weight simulated events to “fill” the public view
    const simulatedEvents = [
      {
        id: 'sim-1',
        type: 'simulated',
        reference: 'RFQ – Premium Pomegranates',
        port: 'Dubai, UAE',
        estimatedDeparture: null,
        estimatedArrival: null,
        label: 'Upcoming RFQ - Gulf Chain',
      },
      {
        id: 'sim-2',
        type: 'simulated',
        reference: 'Spot Deal – Green Chilly',
        port: 'Doha, Qatar',
        estimatedDeparture: null,
        estimatedArrival: null,
        label: 'Spot Market Opportunity',
      },
    ];

    return {
      success: true,
      events: [...realEvents, ...simulatedEvents],
    };
  } catch (err) {
    console.error('fetchPublicShipmentTimeline fatal error', err);
    return { success: false, error: err.message, events: [] };
  }
}

export async function fetchMarketPulse() {
  try {
    // You already have a market_prices table as per previous chats
    const { data, error } = await supabase
      .from('market_prices')
      .select('id, commodity_type, market, price, currency, unit, updated_at')
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('market_prices warning', error);
    }

    const items = (data || []).map((row) => ({
      id: row.id,
      commodity: row.commodity_type || 'Commodity',
      market: row.market || 'Global',
      price: row.price,
      unit: row.unit || 'kg',
      currency: row.currency || 'USD',
      updatedAt: row.updated_at,
    }));

    return { success: true, items };
  } catch (err) {
    console.error('fetchMarketPulse fatal error', err);
    return { success: false, items: [], error: err.message };
  }
}

export async function fetchDealRoomSpotlight() {
  try {
    // Recent real exports as “deals”
    const { data, error } = await supabase
      .from('export_orders')
      .select('id, export_reference, amount_received, port_of_discharge, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.warn('deal room export_orders warning', error);
    }

    const realDeals = (data || []).map((row) => ({
      id: row.id,
      type: 'real',
      title: row.export_reference || 'Confirmed Export',
      port: row.port_of_discharge || 'N/A',
      value: row.amount_received || 0,
      createdAt: row.created_at,
      status: 'confirmed',
    }));

    // Some highlighted “RFQ / simulated” items
    const rfqSim = [
      {
        id: 'rfq-sim-1',
        type: 'rfq',
        title: 'RFQ: 1x40ft – Fresh Pomegranates (Bhagwa)',
        port: 'Jebel Ali, UAE',
        value: 0,
        createdAt: new Date().toISOString(),
        status: 'open',
      },
      {
        id: 'rfq-sim-2',
        type: 'rfq',
        title: 'RFQ: 2x20ft – Green Coconut & Banana Mix',
        port: 'Kuwait Port',
        value: 0,
        createdAt: new Date().toISOString(),
        status: 'negotiation',
      },
    ];

    return { success: true, deals: [...rfqSim, ...realDeals] };
  } catch (err) {
    console.error('fetchDealRoomSpotlight fatal error', err);
    return { success: false, deals: [], error: err.message };
  }
}
