import { supabase } from "../supabaseClient";

export async function listProducts() {
  return supabase.from('products').select('*').order('updated_at', { ascending: false });
}

export async function getProduct(id) {
  return supabase.from('products').select('*').eq('id', id).single();
}

export async function createProduct(obj) {
  obj.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('products').insert(obj).select().single();
  return { data, error };
}

export async function updateProduct(id, obj) {
  obj.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('products').update(obj).eq('id', id).select().single();
  return { data, error };
}

export async function deleteProduct(id) {
  const { data, error } = await supabase.from('products').delete().eq('id', id).select().single();
  return { data, error };
}
