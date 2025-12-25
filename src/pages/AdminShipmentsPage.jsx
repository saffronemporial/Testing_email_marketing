import React from "react";
import ShipmentsTable from "../components/Shipments/ShipmentsTable";
import ShipmentMap from "../components/Shipments/ShipmentMap";

const AdminShipments = () => (
  <div style={{padding:20}}>
    <h2>Admin — Shipments</h2>
    <ShipmentsTable />
    <ShipmentMap />
  </div>
);
export default AdminShipments;
