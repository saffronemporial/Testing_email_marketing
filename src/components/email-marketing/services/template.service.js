import { supabase } from "../../../supabaseClient";

export async function fetchTemplates({ categoryId } = {}) {
  let query = supabase
    .from("email_templates")
    .select(`
      *,
      template_categories (
        id, name, color, icon
      )
    `)
    .order("created_at", { ascending: false });

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("template_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function createTemplate(payload) {
  const { data, error } = await supabase
    .from("email_templates")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTemplate(id, payload) {
  const { data, error } = await supabase
    .from("email_templates")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTemplate(id) {
  const { error } = await supabase
    .from("email_templates")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
