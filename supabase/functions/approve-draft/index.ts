import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Invalid token", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
    .from("ai_email_drafts")
    .update({ status: "approved" })
    .eq("approval_token", token)
    .select()
    .single();

  if (error) {
    return new Response("Approval failed", { status: 500 });
  }

  return new Response("Draft approved successfully. You may close this page.");
});
