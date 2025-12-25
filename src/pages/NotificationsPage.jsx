import React from "react";
import Alerts from "../components/Notifications/Alerts";
import Reports from "../components/Notifications/Reports";

const NotificationsPage = () => (
  <div style={{padding:20}}>
    <h2>Notifications</h2>
    <Alerts />
    <hr/>
    <Reports />
  </div>
);
export default NotificationsPage;
