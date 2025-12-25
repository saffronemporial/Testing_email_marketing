import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/Auth/ProtectedRoute";
import StaffDashboard from "../components/Dashboard/StaffDashboard";

const Staff = () => (
  <ProtectedRoute allow={["staff","admin"]}>
    <div style={{padding:20}}><StaffDashboard /></div>
  </ProtectedRoute>
);
export default Staff;
