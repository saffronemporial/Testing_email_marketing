import React from "react";
import ExpenseManager from "../components/Expenses/ExpenseManager";
import FinancialDashboard from "../components/Expenses/FinancialDashboard";

const AdminExpenses = () => (
  <div style={{padding:20}}>
    <h2>Admin — Expenses</h2>
    <ExpenseManager />
    <hr/>
    <FinancialDashboard />
  </div>
);
export default AdminExpenses;
