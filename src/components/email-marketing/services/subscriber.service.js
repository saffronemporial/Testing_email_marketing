import { supabase } from "../../../supabaseClient";

const PAGE_SIZE = 25;

export async function fetchSubscribers({
  page = 1,
  status,
  search,
  tags = [],
} = {}) {
  try {
    let query = supabase
      .from("subscribers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (status) query = query.eq("status", status);
    if (search)
      query = query.ilike("email", `%${search.toLowerCase()}%`);
    if (tags.length > 0) query = query.contains("tags", tags);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data, count, pageSize: PAGE_SIZE };
  } catch (err) {
    console.error("fetchSubscribers:", err);
    throw err;
  }
}

export async function getSubscriberById(id) {
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateSubscriber(id, payload) {
  const { data, error } = await supabase
    .from("subscribers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function bulkUpdateStatus(ids, status) {
  const { error } = await supabase
    .from("subscribers")
    .update({ status })
    .in("id", ids);
  if (error) throw error;
}

export async function deleteSubscriber(id) {
  const { error } = await supabase
    .from("subscribers")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function exportSubscribers() {
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
