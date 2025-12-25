import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import SmartRecommendations from "../AI/SmartRecommendations";

const currency = (n = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    n || 0
  );

export default function ClientAnalyticsDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: o }, { data: s }] = await Promise.all([
        supabase.from("orders").select("*").eq("client_id", user.id),
        supabase.from("shipments").select("*").eq("client_id", user.id),
      ]);
      setOrders(o || []);
      setShipments(s || []);
    };
    load();
  }, [user]);

  const mySpend = useMemo(
    () => orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    [orders]
  );

  const pendingShipments = useMemo(
    () => shipments.filter((s) => (s.status || "").toLowerCase() !== "delivered").length,
    [shipments]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron to-pomegranate text-white p-8 relative">
      <div className="absolute inset-0 bg-[url('/assets/pomegranate_bg.png')] bg-cover bg-center opacity-5" />
      <div className="relative z-10">
        <h1 className="text-3xl font-extrabold mb-2 drop-shadow-lg">🍎 My Business Insights</h1>
        <p className="text-white/80 mb-6">
          Personalized AI-driven recommendations for your exports.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="My Orders" value={orders.length} />
          <Card title="Total Spend" value={currency(mySpend)} />
          <Card title="Active Shipments" value={pendingShipments} />
        </div>

        <div className="mt-8">
          <SmartRecommendations role="client" />
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20">
      <div className="text-sm text-white/70">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
