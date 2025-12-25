import { supabase } from "../supabaseClient";

export async function createOrder(payload) {
  return await supabase.from("orders").insert({
    product: payload.product,
    quantity: payload.quantity,
    note: payload.note || null,
    user_id: payload.user_id,
    status: "pending"
  }).select().single();
}

export async function listMyOrders(user_id) {
  return await supabase.from("orders").select("*").eq("user_id", user_id).order("created_at", { ascending: false });
}
