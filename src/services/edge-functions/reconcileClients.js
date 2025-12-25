// reconcileClients.js - run manually to backfill/repair clients table from profiles
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  try {
    // Fetch profiles
    const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    const profiles = await r.json();

    for (const p of profiles) {
      // Upsert into clients via RPC or REST upsert (PATCH with on_conflict)
      await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates' // use upsert pattern if supported
        },
        body: JSON.stringify({
          profile_id: p.id,
          contact_person: p.full_name || `${p.first_name || ''} ${p.last_name || ''}`,
          company_name: p.company || p.company_name,
          business_email: p.email,
          business_phone: p.phone,
          country: p.country,
          metadata: {}
        })
      });
    }

    return new Response(JSON.stringify({ status: 'ok', processed: profiles.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
