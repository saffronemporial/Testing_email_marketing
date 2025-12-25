import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminAnalyticsDashboard from "../components/Dashboard/AdminAnalyticsDashboard";
import ClientAnalyticsDashboard from "../components/Dashboard/ClientAnalyticsDashboard";

export default function AnalyticsPage() {
  const { role } = useAuth();
  return role === "admin" ? <AdminAnalyticsDashboard /> : <ClientAnalyticsDashboard />;
}
