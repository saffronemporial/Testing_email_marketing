// src/components/Dashboard/AdminDashboard.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import supabase from "../../supabaseClient";
import "./AdminDashboard.css";
import {
  FaBoxOpen,
  FaShippingFast,
  FaUsers,
  FaClipboardList,
  FaIndustry,
  FaPlus,
  FaChartBar,
  FaExclamationTriangle,
  FaRocket,
  FaMoneyBillWave,
  FaChartLine,
  FaDownload,
  FaSyncAlt,
  FaPlay,
  FaRedo,
  FaBug,
  FaBolt,
  FaPause,
  FaTrash,
  FaCog,
  FaShieldAlt,
  FaFileAlt,
  FaMapMarkedAlt,
  FaRegClock,
  FaGripHorizontal,
  FaNewspaper,
} from "react-icons/fa";

const proxyBase = import.meta.env.VITE_PROXY_URL || "http://localhost:3001/api";
const functionsBase = import.meta.env.VITE_SUPABASE_FUNCTIONS_BASE || import.meta.env.VITE_SUPABASE_URL + "/functions/v1";

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const INR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const INR2 = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n || 0);

export default function AdminDashboard() {
  const { user } = useAuth();
  const userEmail = useMemo(() => user?.email ?? "Admin", [user]);

  // Overview
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeShipments: 0,
    totalClients: 0,
    totalRevenue: 0,
    complianceDocuments: 0,
  });
  const [metrics, setMetrics] = useState({ queueDepth: 0, runRate: 0 });

  // Shipments core
  const [shipments, setShipments] = useState([]);
  const [shipmentsPage, setShipmentsPage] = useState(0);
  const [shipmentsPageSize] = useState(25);
  const [shipmentsTotal, setShipmentsTotal] = useState(0);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCarrier, setFilterCarrier] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShipments, setSelectedShipments] = useState(new Set());
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Recent
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);

  // Logs
  const [logs, setLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(0);
  const [logsPageSize] = useState(50);
  const [logsTotal, setLogsTotal] = useState(0);

  // Pending / DLQ
  const [pendingActions, setPendingActions] = useState([]);
  const [dlqLoading, setDlqLoading] = useState(false);

  // Function health
  const [functionHealth, setFunctionHealth] = useState({});
  const functionList = [
    "automation-manual-send",
    "email-send-emailjs",
    "whatsapp-send-twilio",
    "template-preview",
    "automation-trigger",
    "archive_old_automation_runs",
  ];

  // Provider test harness
  const [providerTest, setProviderTest] = useState({
    channel: "email",
    to: "",
    template_id: "",
    subject: "",
    body: "",
    template_params: "{}",
  });
  const [providerResponse, setProviderResponse] = useState(null);
  const [providerTestLoading, setProviderTestLoading] = useState(false);

  // Workflow controls
  const [automations, setAutomations] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [workflowLoading, setWorkflowLoading] = useState(false);

  // Financial & compliance
  const [finance, setFinance] = useState({ revenueByMonth: [], topClients: [], unpaidInvoices: [] });
  const [complianceExpiring, setComplianceExpiring] = useState([]);

  // Inventory & supply chain
  const [inventory, setInventory] = useState({ items: [], lowStock: [] });
  const [suppliers, setSuppliers] = useState([]);
  const [carrierPerf, setCarrierPerf] = useState([]);

  // Map & timeline
  const [mapRegion, setMapRegion] = useState("Global"); // India, Dubai, Bangladesh, Global
  const [timelineRows, setTimelineRows] = useState([]); // {label, start, end, status}

  // Widgets
  const defaultWidgets = ["SystemAlerts", "NewFeatures", "Shipments", "Workflow", "Finance", "Compliance", "Inventory", "Logs", "DLQ", "Map", "Timeline", "Reports"];
  const [widgetsOrder, setWidgetsOrder] = useState(defaultWidgets);

  // Narrative report
  const [report, setReport] = useState("");

  // System alerts & monitoring
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    cpuUsage: Math.random() * 100,
    memoryUsage: Math.random() * 100,
    dbConnections: Math.floor(Math.random() * 50),
    errorRate: Math.random() * 5,
  });

  // New features launch tracking
  const [newFeatures, setNewFeatures] = useState([
    { id: 1, name: "AI-Powered Analytics", status: "beta", icon: <FaChartLine />, description: "Real-time insights and predictions", progress: 75 },
    { id: 2, name: "Automation Studio", status: "launching", icon: <FaRocket />, description: "Visual workflow builder", progress: 90 },
    { id: 3, name: "Smart Alerts", status: "beta", icon: <FaExclamationTriangle />, description: "Intelligent notification system", progress: 60 },
  ]);

  // UI
  const [error, setError] = useState(null);

  const getSessionToken = useCallback(async () => {
    try {
      const s = await supabase.auth.getSession();
      return s?.data?.session?.access_token ?? null;
    } catch {
      return null;
    }
  }, []);

  async function initSystemHealth() {
    try {
      // Simulate system metrics (in production, fetch from your monitoring service)
      const alerts = [];
      
      setSystemHealth({
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        dbConnections: Math.floor(Math.random() * 50),
        errorRate: Math.random() * 5,
      });

      // Generate critical alerts based on thresholds
      if (Math.random() * 100 > 80) {
        alerts.push({ id: 1, type: "warning", title: "High CPU Usage", message: "CPU usage exceeded 80%", icon: <FaExclamationTriangle />, timestamp: new Date() });
      }
      if (Math.random() * 100 > 75) {
        alerts.push({ id: 2, type: "error", title: "Database Connection Pool", message: "Connection pool utilization at 85%", icon: <FaExclamationTriangle />, timestamp: new Date() });
      }
      if (metrics.queueDepth > 100) {
        alerts.push({ id: 3, type: "warning", title: "Queue Backlog", message: `${metrics.queueDepth} pending actions in queue`, icon: <FaExclamationTriangle />, timestamp: new Date() });
      }

      setSystemAlerts(alerts);
    } catch (err) {
      console.error("initSystemHealth error", err);
    }
  }

  const callFunction = useCallback(
    async (fnName, body = {}) => {
      const token = await getSessionToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const request_id = body.request_id ?? uuid();
      const idempotency_key = body.idempotency_key ?? `idemp-${uuid()}`;
      body.request_id = request_id;
      body.idempotency_key = idempotency_key;

      try {
        // Use proxy server for function calls: POST /api/supabase/functions/:name
        const proxyUrl = `${proxyBase.replace(/\/$/, "")}/supabase/functions/${fnName}`;
        const res = await fetch(proxyUrl, { method: "POST", headers, body: JSON.stringify(body) });
        const text = await res.text();
        // Handle empty or non-JSON bodies (eg. Supabase returns empty object on 404)
        if (res.status === 404) {
          return { ok: false, status: 404, via: "proxy", url: proxyUrl, body: { error: `Function ${fnName} not found (proxy/upstream 404)` } };
        }
        let json;
        try {
          json = text ? JSON.parse(text) : null;
        } catch {
          json = { raw: text };
        }
        return { ok: res.ok, status: res.status, via: "proxy", url: proxyUrl, body: json };
      } catch (err) {
        console.error("callFunction error", err);
        return { ok: false, error: String(err), via: "error" };
      }
    },
    [getSessionToken]
  );

  useEffect(() => {
    initOverview();
    initWorkflow();
    initFinanceCompliance();
    initInventorySupply();
    loadShipmentsPage(shipmentsPage);
    loadLogsPage(logsPage);
    loadPendingActions();
    runFunctionHealthChecks();
    generateNarrativeReport();
    initSystemHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initOverview() {
    setError(null);
    try {
      const [
        ordersRes,
        shipmentsRes,
        clientsRes,
        revenueRes,
        docsRes,
        recentOrdersRes,
        recentShipmentsRes,
        pendingCountRes,
        runsCountRes,
      ] = await Promise.all([
        supabase.from("orders").select("id,status,total_amount,created_at"),
        supabase.from("shipments").select("id,status,carrier,estimated_delivery,shipment_date,actual_delivery"),
        supabase.from("profiles").select("id").eq("role", "client"),
        supabase.from("orders").select("total_amount").eq("status", "completed"),
        supabase.from("compliance_documents").select("id,expiry_date,status"),
        supabase
          .from("orders")
          .select("id,total_amount,status,created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("shipments")
          .select("id,order_id,tracking_number,carrier,shipment_date,estimated_delivery,actual_delivery,status,shipping_cost,notes,created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("pending_actions").select("id", { count: "exact", head: true }),
        supabase.from("automation_runs").select("id", { count: "exact", head: true }),
      ]);

      const orders = ordersRes.data ?? [];
      const shipmentsAll = shipmentsRes.data ?? [];
      const clients = clientsRes.data ?? [];
      const revenueRows = revenueRes.data ?? [];
      const docs = docsRes.data ?? [];
      const ro = recentOrdersRes.data ?? [];
      const rs = recentShipmentsRes.data ?? [];
      const pendingCount = pendingCountRes.count ?? 0;
      const runsCount = runsCountRes.count ?? 0;

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        activeShipments: shipmentsAll.filter((s) => s.status === "in_transit").length,
        totalClients: clients.length,
        totalRevenue: revenueRows.reduce((s, r) => s + (Number(r.total_amount) || 0), 0),
        complianceDocuments: docs.length,
      });

      setRecentOrders(ro);
      setRecentShipments(rs);
      setMetrics({ queueDepth: pendingCount, runRate: runsCount });

      // Timeline rows from shipments
      setTimelineRows(
        shipmentsAll.slice(0, 50).map((s) => ({
          label: s.carrier || "Unknown",
          start: s.shipment_date ? new Date(s.shipment_date) : new Date(s.created_at || Date.now()),
          end: s.estimated_delivery ? new Date(s.estimated_delivery) : new Date(Date.now() + 3 * 24 * 3600 * 1000),
          status: s.status || "pending",
        }))
      );
    } catch (err) {
      console.error("initOverview error", err);
      setError("Failed to load overview");
    }
  }

  async function initWorkflow() {
    setWorkflowLoading(true);
    try {
      const [autoRes, trigRes] = await Promise.all([
        supabase.from("segment_automations").select("*").order("created_at", { ascending: false }),
        supabase.from("automation_triggers").select("*").order("created_at", { ascending: false }),
      ]);
      setAutomations(autoRes.data ?? []);
      setTriggers(trigRes.data ?? []);
    } catch (err) {
      console.error("initWorkflow error", err);
    } finally {
      setWorkflowLoading(false);
    }
  }

  async function initFinanceCompliance() {
    try {
      const [ordersRes, clientsRes] = await Promise.all([
        supabase.from("orders").select("id,total_amount,created_at,client_id,status").catch(e => ({ data: null, error: e })),
        supabase.from("profiles").select("id,first_name,last_name").eq("role", "client").catch(e => ({ data: null, error: e })),
      ]);

      const orders = ordersRes?.data ?? [];
      const clients = clientsRes?.data ?? [];
      
      const byMonth = {};
      for (const o of orders) {
        const m = (o.created_at || "").slice(0, 7);
        byMonth[m] = (byMonth[m] || 0) + (Number(o.total_amount) || 0);
      }
      const revenueByMonth = Object.entries(byMonth)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([month, total]) => ({ month, total }));

      const revenueByClient = {};
      for (const o of orders) {
        const c = o.client_id || "unknown";
        revenueByClient[c] = (revenueByClient[c] || 0) + (Number(o.total_amount) || 0);
      }
      const topClients = Object.entries(revenueByClient)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([cid, total]) => ({
          client_id: cid,
          name: clients.find((c) => c.id === cid)
            ? `${clients.find((c) => c.id === cid)?.first_name || ""} ${clients.find((c) => c.id === cid)?.last_name || ""}`.trim()
            : cid,
          total,
        }));

      // Try to load compliance docs, but don't fail if table doesn't exist
      let complianceDocs = [];
      try {
        const docsRes = await supabase.from("compliance_documents").select("id,title,expiry_date,status,client_id");
        if (docsRes.data) complianceDocs = docsRes.data;
      } catch (err) {
        console.warn("compliance_documents table not available:", err);
      }

      const expiring = complianceDocs.filter((d) => {
        const days = d.expiry_date ? Math.round((new Date(d.expiry_date).getTime() - Date.now()) / (24 * 3600 * 1000)) : null;
        return days !== null && days <= 30;
      });

      setFinance({ revenueByMonth, topClients, unpaidInvoices: [] });
      setComplianceExpiring(expiring);
    } catch (err) {
      console.error("initFinanceCompliance error", err);
      setFinance({ revenueByMonth: [], topClients: [], unpaidInvoices: [] });
      setComplianceExpiring([]);
    }
  }

  async function initInventorySupply() {
    try {
      const [shipmentsRes] = await Promise.all([
        supabase.from("shipments").select("id,carrier,status,shipment_date,actual_delivery").catch(e => ({ data: null })),
      ]);
      
      const shipmentsAll = shipmentsRes?.data ?? [];

      // Carrier performance: delivered within 3 days of shipment_date
      const perfMap = {};
      for (const s of shipmentsAll) {
        const c = s.carrier || "Unknown";
        const shipped = s.shipment_date ? new Date(s.shipment_date).getTime() : null;
        const delivered = s.actual_delivery ? new Date(s.actual_delivery).getTime() : null;
        const fast = shipped && delivered ? (delivered - shipped) <= 3 * 24 * 3600 * 1000 : false;
        perfMap[c] = perfMap[c] || { total: 0, fast: 0 };
        perfMap[c].total += 1;
        perfMap[c].fast += fast ? 1 : 0;
      }
      const carrierPerf = Object.entries(perfMap).map(([carrier, { total, fast }]) => ({
        carrier,
        total,
        fast_pct: total ? Number(((fast / total) * 100).toFixed(1)) : 0,
      }));
      
      // Set empty data for inventory/suppliers since tables may not exist
      setInventory({ items: [], lowStock: [] });
      setSuppliers([]);
      setCarrierPerf(carrierPerf);
    } catch (err) {
      console.error("initInventorySupply error", err);
      setInventory({ items: [], lowStock: [] });
      setSuppliers([]);
      setCarrierPerf([]);
    }
  }

  async function loadShipmentsPage(page = 0) {
    setShipmentsLoading(true);
    setError(null);
    try {
      const from = page * shipmentsPageSize;
      const to = from + shipmentsPageSize - 1;
      let q = supabase
        .from("shipments")
        .select(
          "id,order_id,tracking_number,carrier,shipment_date,estimated_delivery,actual_delivery,status,shipping_cost,notes,created_at,updated_at",
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(from, to);
      if (filterStatus) q = q.eq("status", filterStatus);
      if (filterCarrier) q = q.eq("carrier", filterCarrier);
      if (searchQuery) q = q.or(`tracking_number.ilike.%${searchQuery}%,carrier.ilike.%${searchQuery}%`);
      const res = await q;
      if (res.error) throw res.error;
      setShipments(res.data ?? []);
      setShipmentsTotal(res.count ?? 0);
    } catch (err) {
      console.error("loadShipmentsPage error", err);
      setError("Failed to load shipments");
    } finally {
      setShipmentsLoading(false);
    }
  }

  async function loadLogsPage(page = 0) {
    try {
      const from = page * logsPageSize;
      const to = from + logsPageSize - 1;
      const res = await supabase.from("communication_logs").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
      if (res.error) throw res.error;
      setLogs(res.data ?? []);
      setLogsTotal(res.count ?? 0);
    } catch (err) {
      console.error("loadLogsPage error", err);
    }
  }

  async function loadPendingActions() {
    setDlqLoading(true);
    try {
      const res = await supabase.from("pending_actions").select("*").order("created_at", { ascending: false }).limit(200);
      if (res.error) throw res.error;
      setPendingActions(res.data ?? []);
    } catch (err) {
      console.error("loadPendingActions error", err);
    } finally {
      setDlqLoading(false);
    }
  }

  async function updateShipmentStatus(id, newStatus) {
    try {
      const { error } = await supabase.from("shipments").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      loadShipmentsPage(shipmentsPage);
      try {
        await supabase.from("admin_audit").insert([{ actor: userEmail, action: "update_shipment_status", target_id: id, payload: { status: newStatus }, created_at: new Date().toISOString() }]);
      } catch {}
    } catch (err) {
      console.error("updateShipmentStatus error", err);
      alert("Failed to update shipment");
    }
  }

  function toggleSelectShipment(id) {
    setSelectedShipments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function clearSelection() {
    setSelectedShipments(new Set());
  }
  async function bulkUpdateShipmentsStatus(ids = [], newStatus) {
    if (!ids.length) return;
    try {
      const { error } = await supabase.from("shipments").update({ status: newStatus, updated_at: new Date().toISOString() }).in("id", ids);
      if (error) throw error;
      clearSelection();
      loadShipmentsPage(shipmentsPage);
    } catch (err) {
      console.error("bulkUpdateShipmentsStatus error", err);
      alert("Bulk update failed");
    }
  }

  function exportToCSV(rows = [], filename = "export.csv") {
    if (!rows || !rows.length) return alert("No rows to export");
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(",")]
      .concat(rows.map((r) => headers.map((h) => {
        const v = r[h];
        if (v === null || typeof v === "undefined") return "";
        if (typeof v === "string") return `"${v.replace(/"/g, '""')}"`;
        return `"${String(v)}"`;
      }).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function runFunctionHealthChecks() {
    const results = {};
    for (const fn of functionList) {
      try {
        const res = await callFunction(fn, { action: "health", request_id: uuid() });
        results[fn] = { 
          ok: res.ok, 
          status: res.status ?? "unknown", 
          via: res.via ?? "unknown", 
          url: res.url ?? "N/A", 
          body: res.body ?? res.error ?? "No response" 
        };
      } catch (err) {
        results[fn] = { ok: false, status: "error", error: String(err), via: "error" };
      }
    }
    setFunctionHealth(results);
  }

  // Workflow controls
  async function toggleAutomation(a) {
    try {
      const { error } = await supabase.from("segment_automations").update({ is_active: !a.is_active, updated_at: new Date().toISOString() }).eq("id", a.id);
      if (error) throw error;
      initWorkflow();
    } catch (err) {
      console.error("toggleAutomation error", err);
      alert("Toggle failed");
    }
  }
  async function runAutomationNow(a) {
    try {
      const res = await callFunction("automation-trigger", { automation_id: a.id });
      alert(`Triggered: ${JSON.stringify(res.body || res, null, 2)}`);
    } catch (err) {
      alert(String(err));
    }
  }
  async function toggleTrigger(t) {
    try {
      const { error } = await supabase.from("automation_triggers").update({ is_active: !t.is_active, updated_at: new Date().toISOString() }).eq("id", t.id);
      if (error) throw error;
      initWorkflow();
    } catch (err) {
      console.error("toggleTrigger error", err);
    }
  }
  async function runTriggerNow(t) {
    try {
      const payload = {
        event_source: "manual_trigger",
        event_table: `trigger_${t.id}`,
        event_type: "manual_run",
        event_payload: { trigger_id: t.id, trigger_config: t.trigger_config },
        status: "pending",
        attempts: 0,
        created_at: new Date().toISOString(),
        next_run_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("pending_actions").insert([payload]);
      if (error) throw error;
      alert("Enqueued");
      loadPendingActions();
    } catch (err) {
      console.error("runTriggerNow error", err);
      alert("Run trigger failed");
    }
  }

  // Provider test harness
  async function runProviderTest(e) {
    e?.preventDefault();
    setProviderTestLoading(true);
    setProviderResponse(null);
    try {
      const channel = providerTest.channel;
      const recipients = channel === "email" ? [{ email: providerTest.to }] : [{ phone: providerTest.to }];
      const template_params = (() => { try { return JSON.parse(providerTest.template_params || "{}"); } catch { return {}; } })();
      const res = await callFunction("automation-manual-send", {
        mode: "direct",
        channel,
        template_id: providerTest.template_id || null,
        recipients,
        subject: providerTest.subject || undefined,
        body: providerTest.body || undefined,
        template_params,
      });
      setProviderResponse(res);
    } catch (err) {
      setProviderResponse({ ok: false, error: String(err) });
    } finally {
      setProviderTestLoading(false);
    }
  }

  // Narrative report
  function generateNarrativeReport() {
    const lines = [];
    lines.push(`Operations summary: ${new Date().toLocaleDateString()}`);
    lines.push(`- Total orders: ${stats.totalOrders}, pending: ${stats.pendingOrders}`);
    lines.push(`- Active shipments: ${stats.activeShipments}`);
    lines.push(`- Clients: ${stats.totalClients}`);
    lines.push(`- Revenue (approx): ${INR(stats.totalRevenue)}`);
    lines.push(`- Queue depth: ${metrics.queueDepth}, run rate: ${metrics.runRate}`);
    setReport(lines.join("\n"));
  }

  useEffect(() => {
    generateNarrativeReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, metrics]);

  // Map filtering (simple regions)
  function mapFilter(region) {
    setMapRegion(region);
    setFilterCarrier(""); // reset
    setFilterStatus(""); // reset
    setShipmentsPage(0);
    // Example: narrow by carrier heuristic
    if (region === "Dubai") setFilterCarrier("DHL");
    else if (region === "Bangladesh") setFilterCarrier("Aramex");
    else if (region === "India") setFilterCarrier(""); // keep all
    loadShipmentsPage(0);
  }

  // Widgets order controls
  function moveWidgetLeft(i) {
    if (i <= 0) return;
    setWidgetsOrder((prev) => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  }
  function moveWidgetRight(i) {
    if (i >= widgetsOrder.length - 1) return;
    setWidgetsOrder((prev) => {
      const next = [...prev];
      [next[i + 1], next[i]] = [next[i], next[i + 1]];
      return next;
    });
  }

  return (
    <div className="ad-root">
      {/* Header with animated gold gradient */}
      <div className="ad-header glow">
        <div>
          <h1 className="ad-title shimmer">Admin Command Center</h1>
          <p className="ad-sub">Welcome back, {userEmail}</p>
        </div>
        <div className="ad-header-actions">
          <button
            className="ad-btn ghost pulse"
            onClick={() => {
              initOverview();
              initWorkflow();
              initFinanceCompliance();
              initInventorySupply();
              loadShipmentsPage(shipmentsPage);
              loadLogsPage(logsPage);
              loadPendingActions();
              runFunctionHealthChecks();
            }}
            title="Refresh all"
          >
            <FaSyncAlt /> Refresh
          </button>
          <button className="ad-btn shine" onClick={() => exportToCSV(shipments, `shipments_${new Date().toISOString().slice(0, 10)}.csv`)}>
            <FaDownload /> Export Shipments
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="ad-stats-grid">
        <StatCard title="Total Orders" value={stats.totalOrders} badge={`${stats.pendingOrders} Pending`} icon={<FaBoxOpen />} />
        <StatCard title="Active Shipments" value={stats.activeShipments} icon={<FaShippingFast />} />
        <StatCard title="Total Clients" value={stats.totalClients} icon={<FaUsers />} />
        <StatCard title="Revenue (approx)" value={INR(stats.totalRevenue)} icon={<FaMoneyBillWave />} />
        <StatCard title="Compliance Docs" value={stats.complianceDocuments} icon={<FaClipboardList />} />
        <StatCard title="Queue Depth" value={metrics.queueDepth} icon={<FaBolt />} />
      </div>

      {/* Widgets order controls */}
      <div className="ad-panel ad-widget-controls">
        <h3><FaGripHorizontal /> Customize layout</h3>
        <div className="ad-widget-row">
          {widgetsOrder.map((w, i) => (
            <div key={w} className="ad-widget-chip">
              <span>{w}</span>
              <div className="ad-chip-actions">
                <button className="ad-btn small ghost" onClick={() => moveWidgetLeft(i)}>◀</button>
                <button className="ad-btn small ghost" onClick={() => moveWidgetRight(i)}>▶</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Render widgets in chosen order */}
      {widgetsOrder.map((w) => {
        if (w === "Shipments")
          return (
            <div key="Shipments" className="ad-panel">
              <div className="ad-panel-header">
                <h3 className="shimmer">Shipments</h3>
                <div className="ad-panel-controls">
                  <select className="ad-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setShipmentsPage(0); }}>
                    <option value="">All statuses</option>
                    <option value="pending">pending</option>
                    <option value="in_transit">in_transit</option>
                    <option value="out_for_delivery">out_for_delivery</option>
                    <option value="delivered">delivered</option>
                    <option value="delayed">delayed</option>
                  </select>
                  <input className="ad-input" placeholder="Search tracking / carrier" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShipmentsPage(0); }} />
                  <select className="ad-select" value={filterCarrier} onChange={(e) => { setFilterCarrier(e.target.value); setShipmentsPage(0); }}>
                    <option value="">All carriers</option>
                    <option value="DHL">DHL</option>
                    <option value="FedEx">FedEx</option>
                    <option value="UPS">UPS</option>
                    <option value="Aramex">Aramex</option>
                  </select>
                  <button className="ad-btn ghost" onClick={() => { setFilterStatus(""); setFilterCarrier(""); setSearchQuery(""); setShipmentsPage(0); }}>Clear</button>
                </div>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" onChange={(e) => { if (e.target.checked) setSelectedShipments(new Set(shipments.map((s) => s.id))); else setSelectedShipments(new Set()); }} checked={selectedShipments.size > 0 && selectedShipments.size === shipments.length} /></th>
                      <th>ID</th>
                      <th>Order</th>
                      <th>Tracking</th>
                      <th>Carrier</th>
                      <th>Estimated</th>
                      <th>Status</th>
                      <th>Cost</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipmentsLoading ? (
                      <tr><td colSpan={9}>Loading…</td></tr>
                    ) : shipments.length ? (
                      shipments.map((s) => (
                        <tr key={s.id}>
                          <td><input type="checkbox" checked={selectedShipments.has(s.id)} onChange={() => toggleSelectShipment(s.id)} /></td>
                          <td className="mono">{String(s.id).slice(-8)}</td>
                          <td>{s.order_id ? String(s.order_id).slice(-8) : "—"}</td>
                          <td>{s.tracking_number ?? "—"}</td>
                          <td>{s.carrier ?? "—"}</td>
                          <td>{s.estimated_delivery ? new Date(s.estimated_delivery).toLocaleDateString() : "—"}</td>
                          <td>
                            <select value={s.status ?? "pending"} onChange={(e) => updateShipmentStatus(s.id, e.target.value)}>
                              <option value="pending">pending</option>
                              <option value="in_transit">in_transit</option>
                              <option value="out_for_delivery">out_for_delivery</option>
                              <option value="delivered">delivered</option>
                              <option value="delayed">delayed</option>
                            </select>
                          </td>
                          <td>{INR2(s.shipping_cost)}</td>
                          <td>
                            <button className="ad-btn small ghost" onClick={() => setSelectedShipment(s)}>View</button>
                            <Link to={`/admin/shipments/${s.id}`} className="ad-btn small">Open</Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={9}><NoData text="No shipments found" /></td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="ad-panel-footer">
                <div className="ad-bulk-actions">
                  <button className="ad-btn ghost" onClick={() => bulkUpdateShipmentsStatus(Array.from(selectedShipments), "delivered")}>Mark Delivered</button>
                  <button className="ad-btn ghost" onClick={() => exportToCSV(shipments.filter((s) => selectedShipments.has(s.id)), "shipments_selected.csv")}>Export Selected</button>
                  <button className="ad-btn ghost" onClick={() => setSelectedShipments(new Set())}>Clear Selection</button>
                </div>

                <div className="ad-pagination">
                  <button className="ad-btn small ghost" onClick={() => setShipmentsPage(Math.max(0, shipmentsPage - 1))} disabled={shipmentsPage === 0}>Prev</button>
                  <span className="ad-muted-small">Page {shipmentsPage + 1} • {shipmentsTotal ?? "—"} rows</span>
                  <button className="ad-btn small ghost" onClick={() => setShipmentsPage(shipmentsPage + 1)} disabled={(shipmentsPage + 1) * shipmentsPageSize >= (shipmentsTotal || 0)}>Next</button>
                </div>
              </div>
            </div>
          );

        if (w === "Workflow")
          return (
            <div key="Workflow" className="ad-panel">
              <div className="ad-panel-header">
                <h3 className="shimmer"><FaCog /> Workflow Controls</h3>
                <div className="ad-panel-controls">
                  <button className="ad-btn small ghost" onClick={initWorkflow}><FaSyncAlt /> Refresh</button>
                </div>
              </div>
              <div className="ad-grid-2">
                <Card title="Automations">
                  {workflowLoading ? <NoData text="Loading…" /> : automations.length ? automations.map((a) => (
                    <div key={a.id} className="ad-activity-item">
                      <div>
                        <div className="ad-activity-title">{a.action_name}</div>
                        <div className="ad-activity-sub">Type: {a.automation_type} • Segment: {a.segment_id}</div>
                      </div>
                      <div className="ad-activity-right">
                        <span className={`ad-badge ${a.is_active ? "ad-badge-green" : "ad-badge-gray"}`}>{a.is_active ? "Active" : "Inactive"}</span>
                        <button className="ad-btn small ghost" onClick={() => toggleAutomation(a)}>{a.is_active ? <FaPause /> : <FaPlay />} Toggle</button>
                        <button className="ad-btn small" onClick={() => runAutomationNow(a)}><FaPlay /> Run</button>
                      </div>
                    </div>
                  )) : <NoData text="No automations" />}
                </Card>

                <Card title="Triggers">
                  {workflowLoading ? <NoData text="Loading…" /> : triggers.length ? triggers.map((t) => (
                    <div key={t.id} className="ad-activity-item">
                      <div>
                        <div className="ad-activity-title">{t.trigger_type}</div>
                        <div className="ad-activity-sub">Next: {t.next_trigger_at ? new Date(t.next_trigger_at).toLocaleString() : "—"}</div>
                      </div>
                      <div className="ad-activity-right">
                        <span className={`ad-badge ${t.is_active ? "ad-badge-green" : "ad-badge-gray"}`}>{t.is_active ? "Active" : "Inactive"}</span>
                        <button className="ad-btn small ghost" onClick={() => toggleTrigger(t)}>{t.is_active ? <FaPause /> : <FaPlay />} Toggle</button>
                        <button className="ad-btn small" onClick={() => runTriggerNow(t)}><FaPlay /> Run</button>
                      </div>
                    </div>
                  )) : <NoData text="No triggers" />}
                </Card>
              </div>
            </div>
          );

        if (w === "Finance")
          return (
            <div key="Finance" className="ad-panel">
              <div className="ad-panel-header">
                <h3 className="shimmer"><FaChartBar /> Financial Overview</h3>
                <div className="ad-panel-controls">
                  <button className="ad-btn small ghost" onClick={initFinanceCompliance}><FaSyncAlt /> Refresh</button>
                </div>
              </div>
              <div className="ad-grid-2">
                <Card title="Revenue by month">
                  {finance.revenueByMonth.length ? (
                    <div className="ad-chart">
                      {finance.revenueByMonth.map((r) => (
                        <div key={r.month} className="ad-chart-row">
                          <div className="ad-chart-label">{r.month}</div>
                          <div className="ad-chart-bar-wrap"><div className="ad-chart-bar" style={{ width: `${Math.min(100, (r.total / (stats.totalRevenue || 1)) * 100)}%` }} /></div>
                          <div className="ad-chart-value">{INR(r.total)}</div>
                        </div>
                      ))}
                    </div>
                  ) : <NoData text="No revenue data" />}
                </Card>
                <Card title="Top clients">
                  {finance.topClients.length ? finance.topClients.map((c) => (
                    <div key={c.client_id} className="ad-activity-item">
                      <div className="ad-activity-title">{c.name}</div>
                      <div className="ad-activity-sub">Total: {INR(c.total)}</div>
                    </div>
                  )) : <NoData text="No clients data" />}
                </Card>
              </div>
            </div>
          );

        if (w === "Compliance")
          return (
            <div key="Compliance" className="ad-panel">
              <div className="ad-panel-header">
                <h3 className="shimmer"><FaShieldAlt /> Compliance</h3>
                <div className="ad-panel-controls">
                  <Link to="/admin/compliance-documents" className="ad-btn small">Open</Link>
                </div>
              </div>
              <Card title="Expiring within 30 days">
                {complianceExpiring.length ? complianceExpiring.map((d) => (
                  <div key={d.id} className="ad-activity-item">
                    <div className="ad-activity-title">{d.title}</div>
                    <div className="ad-activity-sub">Expires: {d.expiry_date ? new Date(d.expiry_date).toLocaleDateString() : "—"}</div>
                    <div className="ad-activity-right">
                      <span className="ad-badge ad-badge-yellow">Alert</span>
                      <Link className="ad-btn small ghost" to={`/admin/compliance-documents/${d.id}`}><FaFileAlt /> View</Link>
                    </div>
                  </div>
                )) : <NoData text="No expiring documents" />}
              </Card>
            </div>
          );

        if (w === "Inventory")
          return (
            <div key="Inventory" className="ad-panel">
              <div className="ad-panel-header">
                <h3 className="shimmer"><FaIndustry /> Inventory & Supply</h3>
                <div className="ad-panel-controls">
                  <button className="ad-btn small ghost" onClick={initInventorySupply}><FaSyncAlt /> Refresh</button>
                  <Link to="/admin/inventory" className="ad-btn small">Open</Link>
                </div>
              </div>
              <div className="ad-grid-2">
                <Card title="Low stock">
                  {inventory.lowStock.length ? inventory.lowStock.map((i) => (
                    <div key={i.id} className="ad-activity-item">
                      <div className="ad-activity-title">{i.name} ({i.sku})</div>
                      <div className="ad-activity-sub">Stock: {i.stock} • Threshold: {i.threshold}</div>
                      <div className="ad-activity-right"><span className="ad-badge ad-badge-red">Restock</span></div>
                    </div>
                  )) : <NoData text="All good" />}
                </Card>
                <Card title="Carrier performance (fast % in 3 days)">
                  {carrierPerf.length ? carrierPerf.map((c) => (
                    <div key={c.carrier} className="ad-activity-item">
                      <div className="ad-activity-title">{c.carrier}</div>
                      <div className="ad-activity-sub">Fast: {c.fast_pct}% • Total: {c.total}</div>
                    </div>
                  )) : <NoData text="No carrier data" />}
                </Card>
              </div>
            </div>
          );

        if (w === "Logs")
          return (
            <div key="Logs" className="ad-panel">
              <div className="ad-panel-header">
                <h3 className="shimmer">Communication Logs</h3>
                <div className="ad-panel-controls">
                  <button className="ad-btn small ghost" onClick={() => loadLogsPage(0)}><FaSyncAlt /> Refresh</button>
                  <button className="ad-btn small" onClick={() => exportToCSV(logs, `comm_logs_${new Date().toISOString().slice(0, 10)}.csv`)}><FaDownload /> Export</button>
                </div>
              </div>
              <div style={{ maxHeight: 260, overflow: "auto" }}>
                <table className="ad-table">
                  <thead><tr><th>Time</th><th>Channel</th><th>To</th><th>Status</th><th>Provider</th><th>Actions</th></tr></thead>
                  <tbody>
                    {logs.length ? logs.map((l) => (
                      <tr key={l.id}>
                        <td>{new Date(l.created_at).toLocaleString()}</td>
                        <td>{l.channel}</td>
                        <td>{l.to}</td>
                        <td>{l.status}</td>
                        <td>{l.provider}</td>
                        <td><button className="ad-btn small ghost" onClick={() => alert(JSON.stringify(l, null, 2))}>View</button></td>
                      </tr>
                    )) : <tr><td colSpan={6}><NoData text="No logs" /></td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="ad-panel-footer">
                <div className="ad-pagination">
                  <button className="ad-btn small ghost" onClick={() => setLogsPage(Math.max(0, logsPage - 1))} disabled={logsPage === 0}>Prev</button>
                  <span className="ad-muted-small">Page {logsPage + 1} • {logsTotal ?? "—"} rows</span>
                  <button className="ad-btn small ghost" onClick={() => setLogsPage(logsPage + 1)} disabled={(logsPage + 1) * logsPageSize >= (logsTotal || 0)}>Next</button>
                </div>
              </div>
            </div>
          );

        if (w === "DLQ")
          return (
            <div key="DLQ" className="ad-panel">
              <div className="ad-panel-header">
                <h3 className="shimmer">Pending Actions / DLQ</h3>
                <div className="ad-panel-controls">
                  <button className="ad-btn small ghost" onClick={loadPendingActions}><FaSyncAlt /> Refresh</button>
                  <button className="ad-btn small" onClick={() => exportToCSV(pendingActions, `pending_actions_${new Date().toISOString().slice(0, 10)}.csv`)}><FaDownload /> Export</button>
                </div>
              </div>
              <div style={{ maxHeight: 260, overflow: "auto" }}>
                <table className="ad-table">
                  <thead><tr><th>ID</th><th>Source</th><th>Type</th><th>Status</th><th>Attempts</th><th>Created</th><th>Actions</th></tr></thead>
                  <tbody>
                    {dlqLoading ? <tr><td colSpan={7}>Loading…</td></tr> : pendingActions.length ? pendingActions.map((p) => (
                      <tr key={p.id}>
                        <td className="mono">{String(p.id).slice(-8)}</td>
                        <td>{p.event_source}</td>
                        <td>{p.event_type}</td>
                        <td>{p.status}</td>
                        <td>{p.attempts}</td>
                        <td>{new Date(p.created_at).toLocaleString()}</td>
                        <td>
                          <button className="ad-btn small ghost" onClick={async () => {
                            try {
                              const { error } = await supabase.from("pending_actions").update({ status: "pending", attempts: 0, next_run_at: new Date().toISOString(), last_error: null }).eq("id", p.id);
                              if (error) throw error;
                              loadPendingActions();
                            } catch (err) { alert("Requeue failed"); }
                          }}><FaRedo /> Requeue</button>
                          <button className="ad-btn small ghost" onClick={async () => {
                            try {
                              const { error } = await supabase.from("pending_actions").update({ status: "failed", last_error: "admin_marked_failed" }).eq("id", p.id);
                              if (error) throw error;
                              loadPendingActions();
                            } catch (err) { alert("Mark failed error"); }
                          }}><FaTrash /> Fail</button>
                          <button className="ad-btn small" onClick={() => alert(JSON.stringify(p, null, 2))}>View</button>
                        </td>
                      </tr>
                    )) : <tr><td colSpan={7}><NoData text="No pending actions" /></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          );

        if (w === "Map")
          return (
            <div key="Map" className="ad-panel">
              <div className="ad-panel-header">
                <h3 className="shimmer"><FaMapMarkedAlt /> Interactive Map</h3>
                <div className="ad-panel-controls">
                  <button className={`ad-btn small ghost ${mapRegion === "Global" ? "active" : ""}`} onClick={() => mapFilter("Global")}>Global</button>
                  <button className={`ad-btn small ghost ${mapRegion === "India" ? "active" : ""}`} onClick={() => mapFilter("India")}>India</button>
                  <button className={`ad-btn small ghost ${mapRegion === "Dubai" ? "active" : ""}`} onClick={() => mapFilter("Dubai")}>Dubai</button>
                  <button className={`ad-btn small ghost ${mapRegion === "Bangladesh" ? "active" : ""}`} onClick={() => mapFilter("Bangladesh")}>Bangladesh</button>
                </div>
              </div>
              {/* Simple SVG map (illustrative) */}
              <div className="ad-map-wrap">
                <svg viewBox="0 0 800 400" className="ad-map">
                  <rect x="0" y="0" width="800" height="400" fill="#fffaf0" />
                  {/* Regions */}
                  <circle cx="300" cy="260" r="18" fill={mapRegion === "India" ? "#d4a017" : "#e8cf88"} className="pulse" />
                  <circle cx="560" cy="180" r="18" fill={mapRegion === "Dubai" ? "#d4a017" : "#e8cf88"} className="pulse" />
                  <circle cx="380" cy="210" r="16" fill={mapRegion === "Bangladesh" ? "#d4a017" : "#e8cf88"} className="pulse" />
                  {/* Legend */}
                  <text x="20" y="30" fill="#6b4b0a" fontSize="14">Region: {mapRegion}</text>
                  <text x="20" y="50" fill="#6b6b6b" fontSize="12">Click controls above to filter shipments by region/carrier</text>
                </svg>
              </div>
            </div>
          );

        if (w === "Timeline")
          return (
            <div key="Timeline" className="ad-panel">
              <div className="ad-panel-header">
                <h3 className="shimmer"><FaRegClock /> Timeline</h3>
              </div>
              <div className="ad-timeline">
                {timelineRows.length ? timelineRows.slice(0, 20).map((r, i) => {
                  const totalDays = 30;
                  const day = 24 * 3600 * 1000;
                  const startOffset = Math.max(0, Math.round((r.start.getTime() - (Date.now() - totalDays * day)) / day));
                  const endOffset = Math.min(totalDays, Math.round((r.end.getTime() - (Date.now() - totalDays * day)) / day));
                  const width = Math.max(2, endOffset - startOffset);
                  const left = Math.min(98, Math.max(0, Math.round((startOffset / totalDays) * 100)));
                  const colorClass =
                    r.status === "delivered" ? "bar-green" :
                    r.status === "in_transit" ? "bar-blue" :
                    r.status === "delayed" ? "bar-red" : "bar-yellow";
                  return (
                    <div key={i} className="ad-timeline-row">
                      <div className="ad-timeline-label">{r.label}</div>
                      <div className="ad-timeline-bar-wrap">
                        <div className={`ad-timeline-bar ${colorClass}`} style={{ left: `${left}%`, width: `${width}%` }} />
                      </div>
                    </div>
                  );
                }) : <NoData text="No timeline data" />}
              </div>
            </div>
          );

        if (w === "Reports")
          return (
            <div key="Reports" className="ad-panel">
              <div className="ad-panel-header">
                <h3 className="shimmer"><FaNewspaper /> Narrative Reports</h3>
                <div className="ad-panel-controls">
                  <button className="ad-btn small ghost" onClick={generateNarrativeReport}><FaSyncAlt /> Regenerate</button>
                  <button className="ad-btn small" onClick={() => {
                    const blob = new Blob([report], { type: "text/plain;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `report_${new Date().toISOString().slice(0, 10)}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}><FaDownload /> Export</button>
                </div>
              </div>
              <pre className="ad-pre">{report || "No report yet"}</pre>
            </div>
          );

        return null;
      })}

      {/* Provider test harness */}
      <div className="ad-panel">
        <div className="ad-panel-header">
          <h3 className="shimmer">Provider Test Harness</h3>
          <div className="ad-panel-controls">
            <button className="ad-btn small ghost" onClick={() => { setProviderTest({ channel: "email", to: "", template_id: "", subject: "", body: "", template_params: "{}" }); setProviderResponse(null); }}>
              Reset
            </button>
            <button className="ad-btn small" onClick={runFunctionHealthChecks}><FaPlay /> Health checks</button>
          </div>
        </div>

        <form onSubmit={runProviderTest} className="ad-form">
          <div className="ad-form-row">
            <label>Channel</label>
            <select value={providerTest.channel} onChange={(e) => setProviderTest((p) => ({ ...p, channel: e.target.value }))}>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div className="ad-form-row"><label>To</label><input value={providerTest.to} onChange={(e) => setProviderTest((p) => ({ ...p, to: e.target.value }))} className="ad-input" /></div>
          <div className="ad-form-row"><label>Template ID</label><input value={providerTest.template_id} onChange={(e) => setProviderTest((p) => ({ ...p, template_id: e.target.value }))} className="ad-input" /></div>
          <div className="ad-form-row"><label>Subject</label><input value={providerTest.subject} onChange={(e) => setProviderTest((p) => ({ ...p, subject: e.target.value }))} className="ad-input" /></div>
          <div className="ad-form-row"><label>Body</label><textarea value={providerTest.body} onChange={(e) => setProviderTest((p) => ({ ...p, body: e.target.value }))} className="ad-textarea" /></div>
          <div className="ad-form-row"><label>Template params (JSON)</label><textarea value={providerTest.template_params} onChange={(e) => setProviderTest((p) => ({ ...p, template_params: e.target.value }))} className="ad-textarea" /></div>
          <div className="ad-form-actions">
            <button className="ad-btn shine" type="submit" disabled={providerTestLoading}><FaPlay /> Send Test</button>
            <button className="ad-btn ghost" type="button" onClick={() => setProviderResponse(null)}><FaBug /> Clear</button>
          </div>
        </form>

        <div style={{ marginTop: 12 }}>
          <h4>Response</h4>
          <pre className="ad-pre">{providerResponse ? JSON.stringify(providerResponse, null, 2) : "No response yet"}</pre>
        </div>
      </div>

      {/* Selected shipment modal */}
      {selectedShipment && (
        <div className="ad-modal">
          <div className="ad-modal-card">
            <div className="ad-modal-header">
              <h4 className="shimmer">Shipment {String(selectedShipment.id).slice(-8)}</h4>
              <button className="ad-btn ghost" onClick={() => setSelectedShipment(null)}>Close</button>
            </div>
            <div className="ad-modal-body">
              <pre className="ad-pre">{JSON.stringify(selectedShipment, null, 2)}</pre>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="ad-btn shine" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(selectedShipment)); alert("Copied"); }}><FaDownload /> Copy JSON</button>
                <Link to={`/admin/shipments/${selectedShipment.id}`} className="ad-btn ghost">Open</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="ad-error">
          <p className="ad-error-title">Something’s off</p>
          <p className="ad-error-body">{error}</p>
        </div>
      )}
    </div>
  );
}

/* =========================
   Reusable components
   ========================= */

const StatCard = ({ title, value, icon, link, badge }) => (
  <div className="ad-stat-card rise">
    <div className="ad-stat-left">
      <div className="ad-stat-icon">{icon}</div>
      <div>
        <div className="ad-stat-value">{value}</div>
        <div className="ad-stat-title">{title}</div>
      </div>
    </div>
    <div className="ad-stat-right">
      {badge && <div className="ad-badge">{badge}</div>}
      {link && <Link to={link} className="ad-link-small">View →</Link>}
    </div>
  </div>
);

const Card = ({ title, children }) => (
  <div className="ad-card">
    <h3 className="ad-card-title shimmer">{title}</h3>
    {children}
  </div>
);

const NoData = ({ text }) => <div className="ad-no-data">{text}</div>;
