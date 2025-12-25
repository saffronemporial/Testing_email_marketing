import React, { useEffect, useState } from "react";
import OrderDetails from "../components/Orders/OrderDetails";
import { supabase } from "../supabaseClient";

const OrderInvoicePage = ({ orderId }) => {
  const [order, setOrder] = useState(null);

  useEffect(()=>{ (async ()=>{
    if (!orderId) {
      // try read from location search or path if needed
      return;
    }
    const r = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (!r.error) setOrder(r.data);
  })(); }, [orderId]);

  if (!order) return <div style={{padding:20}}>Order not found</div>;

  return (
    <div style={{padding:20}}>
      <OrderDetails order={order} />
    </div>
  );
};

export default OrderInvoicePage;
