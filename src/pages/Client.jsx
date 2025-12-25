import React from "react";
import ProtectedRoute from "../components/Auth/ProtectedRoute";
import ClientDashboard from "../components/Dashboard/ClientDashboard";

const Client = () => (
  <ProtectedRoute allow={["client","admin"]}>
    <div style={{padding:20}}>
      <ClientDashboard />
    </div>
  </ProtectedRoute>
);
export default Client;
