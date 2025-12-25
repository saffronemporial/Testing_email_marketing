import { supabase } from "../supabaseClient";

export async function createShipment(obj) {
  obj.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('shipments').insert(obj).select().single();
  return { data, error };
}

export async function updateShipment(id, obj) {
  obj.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('shipments').update(obj).eq('id', id).select().single();
  return { data, error };
}

export async function listShipmentsForAdmin() {
  return supabase.from('shipments').select('*').order('updated_at', { ascending: false });
}

export async function listShipmentsForClient(client_id) {
  return supabase.from('shipments').select('*').eq('client_id', client_id).order('updated_at', { ascending: false });
}
