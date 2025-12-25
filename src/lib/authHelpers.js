// src/lib/authHelpers.js
import { supabase } from "../supabaseClient";

/**
 * getCurrentProfileId()
 * - Returns the profile id (profiles.id) associated with the currently authenticated user (auth.user().id)
 * - Returns null if not signed in or profile not found.
 */
export async function getCurrentProfileId() {
  try {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return null;
    const userId = userData.user.id;
    const { data: profileRows, error: profileErr } = await supabase.from("profiles").select("id").eq("id", userId).limit(1).single();
    if (profileErr) {
      // sometimes profile id may be same as auth user id; if not, try match by email
      const { data: alt } = await supabase.from("profiles").select("id").eq("email", userData.user.email).limit(1).single();
      return alt?.id || null;
    }
    return profileRows?.id || null;
  } catch (err) {
    console.warn("getCurrentProfileId error", err);
    return null;
  }
}
