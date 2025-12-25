// src/context/FinanceContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import supabase from "../supabaseClient";

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState([]);
  const [purchasePayments, setPurchasePayments] = useState([]);
  const [orderCosts, setOrderCosts] = useState([]);
  const [shipmentFinancials, setShipmentFinancials] = useState(null);
  const [orderFinancials, setOrderFinancials] = useState(null);

  const [loading, setLoading] = useState({
    purchaseOrders: false,
    purchaseOrderDetail: false,
    costs: false,
    payments: false,
    shipmentFinancials: false,
    orderFinancials: false,
  });

  const [error, setError] = useState(null);

  const setLoadingFlag = (key, value) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  };

  // -------- PURCHASE ORDERS --------

  const fetchPurchaseOrders = useCallback(
    async (filters = {}) => {
      try {
        setError(null);
        setLoadingFlag("purchaseOrders", true);

        let query = supabase.from("purchase_orders").select("*").order("created_at", { ascending: false });

        if (filters.export_order_id) {
          query = query.eq("export_order_id", filters.export_order_id);
        }
        if (filters.supplier_id) {
          query = query.eq("supplier_id", filters.supplier_id);
        }
        if (filters.status) {
          query = query.eq("status", filters.status);
        }

        const { data, error: err } = await query;
        if (err) throw err;
        setPurchaseOrders(data || []);
      } catch (err) {
        console.error("fetchPurchaseOrders error:", err);
        setError(err.message || "Failed to load purchase orders.");
      } finally {
        setLoadingFlag("purchaseOrders", false);
      }
    },
    []
  );

  const fetchPurchaseOrderDetail = useCallback(async (purchaseOrderId) => {
    if (!purchaseOrderId) return;
    try {
      setError(null);
      setLoadingFlag("purchaseOrderDetail", true);

      const { data: po, error: poErr } = await supabase
        .from("purchase_orders")
        .select("*")
        .eq("id", purchaseOrderId)
        .single();

      if (poErr) throw poErr;
      setSelectedPurchaseOrder(po);

      const { data: items, error: itemsErr } = await supabase
        .from("purchase_order_items")
        .select("*")
        .eq("purchase_order_id", purchaseOrderId)
        .order("created_at", { ascending: true });

      if (itemsErr) throw itemsErr;
      setPurchaseOrderItems(items || []);

      // Payments
      const { data: payments, error: paymentsErr } = await supabase
        .from("purchase_payments")
        .select("*")
        .eq("purchase_order_id", purchaseOrderId)
        .order("payment_date", { ascending: true });

      if (paymentsErr) throw paymentsErr;
      setPurchasePayments(payments || []);
    } catch (err) {
      console.error("fetchPurchaseOrderDetail error:", err);
      setError(err.message || "Failed to load purchase order details.");
    } finally {
      setLoadingFlag("purchaseOrderDetail", false);
    }
  }, []);

  const createPurchaseOrder = useCallback(
    async ({ header, items }) => {
      try {
        setError(null);
        setLoadingFlag("purchaseOrders", true);

        // Generate PO number via RPC or local function
        const { data: poNumberData, error: poNumberErr } = await supabase.rpc(
          "fn_generate_po_number"
        );
        if (poNumberErr) throw poNumberErr;

        const poPayload = {
          ...header,
          po_number: poNumberData,
        };

        const { data: po, error: poErr } = await supabase
          .from("purchase_orders")
          .insert(poPayload)
          .select("*")
          .single();

        if (poErr) throw poErr;

        // Insert items
        if (items && items.length > 0) {
          const itemsPayload = items.map((it) => ({
            ...it,
            purchase_order_id: po.id,
            total_price: Number(it.quantity || 0) * Number(it.unit_price || 0),
          }));
          const { error: itemsErr } = await supabase
            .from("purchase_order_items")
            .insert(itemsPayload);

          if (itemsErr) throw itemsErr;
        }

        await fetchPurchaseOrders();
        return po;
      } catch (err) {
        console.error("createPurchaseOrder error:", {
        code: error?.code,
        message: error?.message,
        details: error?.details,
       });
        setError(err.message || "Failed to create purchase order.");
        throw err;
      } finally {
        setLoadingFlag("purchaseOrders", false);
      }
    },
    [fetchPurchaseOrders]
  );

  const updatePurchaseOrder = useCallback(
    async (id, updates) => {
      try {
        setError(null);
        setLoadingFlag("purchaseOrders", true);

        const { error: err } = await supabase
          .from("purchase_orders")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (err) throw err;

        await fetchPurchaseOrders();
        await fetchPurchaseOrderDetail(id);
      } catch (err) {
        console.error("updatePurchaseOrder error:", err);
        setError(err.message || "Failed to update purchase order.");
      } finally {
        setLoadingFlag("purchaseOrders", false);
      }
    },
    [fetchPurchaseOrders, fetchPurchaseOrderDetail]
  );

  const addPurchaseOrderItem = useCallback(
    async (purchaseOrderId, itemData) => {
      try {
        setError(null);
        setLoadingFlag("purchaseOrderDetail", true);

        const payload = {
          ...itemData,
          purchase_order_id: purchaseOrderId,
          total_price:
            Number(itemData.quantity || 0) * Number(itemData.unit_price || 0),
        };

        const { error: err } = await supabase
          .from("purchase_order_items")
          .insert(payload);

        if (err) throw err;

        await fetchPurchaseOrderDetail(purchaseOrderId);
      } catch (err) {
        console.error("addPurchaseOrderItem error:", err);
        setError(err.message || "Failed to add purchase order item.");
      } finally {
        setLoadingFlag("purchaseOrderDetail", false);
      }
    },
    [fetchPurchaseOrderDetail]
  );

  const updatePurchaseOrderItem = useCallback(
    async (itemId, updates) => {
      try {
        setError(null);
        setLoadingFlag("purchaseOrderDetail", true);

        const { data: existing, error: getErr } = await supabase
          .from("purchase_order_items")
          .select("*")
          .eq("id", itemId)
          .single();

        if (getErr) throw getErr;

        const merged = { ...existing, ...updates };
        merged.total_price =
          Number(merged.quantity || 0) * Number(merged.unit_price || 0);

        const { error: err } = await supabase
          .from("purchase_order_items")
          .update({
            ...merged,
            updated_at: new Date().toISOString(),
          })
          .eq("id", itemId);

        if (err) throw err;

        await fetchPurchaseOrderDetail(existing.purchase_order_id);
      } catch (err) {
        console.error("updatePurchaseOrderItem error:", err);
        setError(err.message || "Failed to update purchase order item.");
      } finally {
        setLoadingFlag("purchaseOrderDetail", false);
      }
    },
    [fetchPurchaseOrderDetail]
  );

  const deletePurchaseOrderItem = useCallback(
    async (itemId) => {
      try {
        setError(null);
        setLoadingFlag("purchaseOrderDetail", true);

        const { data: existing, error: getErr } = await supabase
          .from("purchase_order_items")
          .select("*")
          .eq("id", itemId)
          .single();

        if (getErr) throw getErr;

        const { error: err } = await supabase
          .from("purchase_order_items")
          .delete()
          .eq("id", itemId);

        if (err) throw err;

        await fetchPurchaseOrderDetail(existing.purchase_order_id);
      } catch (err) {
        console.error("deletePurchaseOrderItem error:", err);
        setError(err.message || "Failed to delete purchase order item.");
      } finally {
        setLoadingFlag("purchaseOrderDetail", false);
      }
    },
    [fetchPurchaseOrderDetail]
  );

  // -------- PURCHASE PAYMENTS --------

  const fetchPurchasePayments = useCallback(async (purchaseOrderId) => {
    if (!purchaseOrderId) return;
    try {
      setError(null);
      setLoadingFlag("payments", true);

      const { data, error: err } = await supabase
        .from("purchase_payments")
        .select("*")
        .eq("purchase_order_id", purchaseOrderId)
        .order("payment_date", { ascending: true });

      if (err) throw err;
      setPurchasePayments(data || []);
    } catch (err) {
      console.error("fetchPurchasePayments error:", err);
      setError(err.message || "Failed to load purchase payments.");
    } finally {
      setLoadingFlag("payments", false);
    }
  }, []);

  const recordPurchasePayment = useCallback(
    async (purchaseOrderId, paymentData) => {
      try {
        setError(null);
        setLoadingFlag("payments", true);

        const payload = {
          ...paymentData,
          purchase_order_id: purchaseOrderId,
        };

        const { error: err } = await supabase
          .from("purchase_payments")
          .insert(payload);

        if (err) throw err;

        await fetchPurchasePayments(purchaseOrderId);
        await fetchPurchaseOrderDetail(purchaseOrderId); // to refresh header payment_status
      } catch (err) {
        console.error("recordPurchasePayment error:", err);
        setError(err.message || "Failed to record purchase payment.");
        throw err;
      } finally {
        setLoadingFlag("payments", false);
      }
    },
    [fetchPurchasePayments, fetchPurchaseOrderDetail]
  );

  const deletePurchasePayment = useCallback(
    async (paymentId) => {
      try {
        setError(null);
        setLoadingFlag("payments", true);

        const { data: existing, error: getErr } = await supabase
          .from("purchase_payments")
          .select("*")
          .eq("id", paymentId)
          .single();

        if (getErr) throw getErr;

        const { error: err } = await supabase
          .from("purchase_payments")
          .delete()
          .eq("id", paymentId);

        if (err) throw err;

        await fetchPurchasePayments(existing.purchase_order_id);
        await fetchPurchaseOrderDetail(existing.purchase_order_id);
      } catch (err) {
        console.error("deletePurchasePayment error:", err);
        setError(err.message || "Failed to delete purchase payment.");
      } finally {
        setLoadingFlag("payments", false);
      }
    },
    [fetchPurchasePayments, fetchPurchaseOrderDetail]
  );

  // -------- EXPORT ORDER COSTS --------

  const fetchOrderCosts = useCallback(async (exportOrderId) => {
    if (!exportOrderId) return;
    try {
      setError(null);
      setLoadingFlag("costs", true);

      const { data, error: err } = await supabase
        .from("export_costs")
        .select("*")
        .eq("export_order_id", exportOrderId)
        .order("cost_date", { ascending: true });

      if (err) throw err;
      setOrderCosts(data || []);
    } catch (err) {
      console.error("fetchOrderCosts error:", err);
      setError(err.message || "Failed to load order costs.");
    } finally {
      setLoadingFlag("costs", false);
    }
  }, []);

  const addOrderCost = useCallback(
    async (exportOrderId, costData) => {
      try {
        setError(null);
        setLoadingFlag("costs", true);

        const payload = {
          ...costData,
          export_order_id: exportOrderId,
          cost_date: costData.cost_date || new Date().toISOString(),
        };

        const { error: err } = await supabase
          .from("export_costs")
          .insert(payload);

        if (err) throw err;

        await fetchOrderCosts(exportOrderId);
      } catch (err) {
        console.error("addOrderCost error:", {
        code: error?.code,
        message: error?.message,
        details: error?.details,
      });
        setError(err.message || "Failed to add order cost.");
        throw err;
      } finally {
        setLoadingFlag("costs", false);
      }
    },
    [fetchOrderCosts]
  );

  const updateOrderCost = useCallback(
    async (costId, updates) => {
      try {
        setError(null);
        setLoadingFlag("costs", true);

        const { data: existing, error: getErr } = await supabase
          .from("export_costs")
          .select("*")
          .eq("id", costId)
          .single();

        if (getErr) throw getErr;

        const { error: err } = await supabase
          .from("export_costs")
          .update({
            ...existing,
            ...updates,
          })
          .eq("id", costId);

        if (err) throw err;

        await fetchOrderCosts(existing.export_order_id);
      } catch (err) {
        console.error("updateOrderCost error:", err);
        setError(err.message || "Failed to update order cost.");
      } finally {
        setLoadingFlag("costs", false);
      }
    },
    [fetchOrderCosts]
  );

  const deleteOrderCost = useCallback(
    async (costId) => {
      try {
        setError(null);
        setLoadingFlag("costs", true);

        const { data: existing, error: getErr } = await supabase
          .from("export_costs")
          .select("*")
          .eq("id", costId)
          .single();

        if (getErr) throw getErr;

        const { error: err } = await supabase
          .from("export_costs")
          .delete()
          .eq("id", costId);

        if (err) throw err;

        await fetchOrderCosts(existing.export_order_id);
      } catch (err) {
        console.error("deleteOrderCost error:", err);
        setError(err.message || "Failed to delete order cost.");
      } finally {
        setLoadingFlag("costs", false);
      }
    },
    [fetchOrderCosts]
  );

  // -------- ORDER + SHIPMENT FINANCIALS --------

  const fetchOrderFinancials = useCallback(async (exportOrderId) => {
    if (!exportOrderId) return;
    try {
      setError(null);
      setLoadingFlag("orderFinancials", true);

      const { data, error: err } = await supabase
        .from("export_orders")
        .select(
          "id, total_order_value, total_cost, profit_amount, profit_margin, amount_received, amount_pending, profit_status"
        )
        .eq("id", exportOrderId)
        .single();

      if (err) throw err;
      setOrderFinancials(data || null);
    } catch (err) {
      console.error("fetchOrderFinancials error:", err);
      setError(err.message || "Failed to load order financials.");
    } finally {
      setLoadingFlag("orderFinancials", false);
    }
  }, []);

 const fetchShipmentFinancials = async (shipmentId) => {
  try {
    if (!shipmentId) return null;

    const { data, error } = await supabase
      .from("shipment_financials")
      .select("*")
      .eq("shipment_id", shipmentId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle(); // ✅ NO 406 when 0 rows

    if (error) {
      console.error("fetchShipmentFinancials error:", error);
      // If for some reason you still get PGRST116, just treat it as "no snapshot yet".
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    // data can be null when no rows exist → treat as "no snapshot yet"
    return data || null;
  } catch (err) {
    console.error("fetchShipmentFinancials fatal error:", err);
    throw err;
  }
};


  const value = useMemo(
    () => ({
      // state
      purchaseOrders,
      selectedPurchaseOrder,
      purchaseOrderItems,
      purchasePayments,
      orderCosts,
      orderFinancials,
      shipmentFinancials,
      loading,
      error,

      // purchase orders
      fetchPurchaseOrders,
      fetchPurchaseOrderDetail,
      createPurchaseOrder,
      updatePurchaseOrder,
      addPurchaseOrderItem,
      updatePurchaseOrderItem,
      deletePurchaseOrderItem,

      // payments
      fetchPurchasePayments,
      recordPurchasePayment,
      deletePurchasePayment,

      // costs
      fetchOrderCosts,
      addOrderCost,
      updateOrderCost,
      deleteOrderCost,

      // financials
      fetchOrderFinancials,
      fetchShipmentFinancials,
    }),
    [
      purchaseOrders,
      selectedPurchaseOrder,
      purchaseOrderItems,
      purchasePayments,
      orderCosts,
      orderFinancials,
      shipmentFinancials,
      loading,
      error,
      fetchPurchaseOrders,
      fetchPurchaseOrderDetail,
      createPurchaseOrder,
      updatePurchaseOrder,
      addPurchaseOrderItem,
      updatePurchaseOrderItem,
      deletePurchaseOrderItem,
      fetchPurchasePayments,
      recordPurchasePayment,
      deletePurchasePayment,
      fetchOrderCosts,
      addOrderCost,
      updateOrderCost,
      deleteOrderCost,
      fetchOrderFinancials,
      fetchShipmentFinancials,
    ]
  );

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return ctx;
};
