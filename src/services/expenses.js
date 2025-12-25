import { supabase } from "../supabaseClient";

export async function createExpense(obj) {
  const { data, error } = await supabase.from('expenses').insert(obj).select().single();
  return { data, error };
}

export async function listExpenses() {
  return supabase.from('expenses').select('*').order('created_at', { ascending: false });
}

export async function listExpensesByUser(user_id) {
  return supabase.from('expenses').select('*').eq('created_by', user_id).order('created_at', { ascending: false });
}
