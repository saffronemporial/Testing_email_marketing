import { supabase } from "../supabaseClient";

export async function createNotification(user_id, message, type='info', payload={}) {
  return supabase.from('notifications').insert({ user_id, message, type, payload }).select().single();
}

export async function listNotifications(user_id) {
  return supabase.from('notifications').select('*').eq('user_id', user_id).order('created_at', { ascending: false });
}

export async function markNotificationRead(id) {
  return supabase.from('notifications').update({ read: true }).eq('id', id).select().single();
}
