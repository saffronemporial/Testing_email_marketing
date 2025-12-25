// src/services/clientService.js
import { supabase } from '../supabaseClient'; // Use your centralized client

/**
 * Get clients with their profile data - FIXED for multiple relationships
 */
export async function getClientsWithProfiles({ page = 1, pageSize = 25, search = '', filters = {} } = {}) {
  const from = (page - 1) * pageSize;
  
  try {
    // FIRST: Get total count of clients
    const { count: totalCount, error: countError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // SECOND: Get clients with pagination
    let clientsQuery = supabase
      .from('clients')
      .select('*')
      .range(from, from + pageSize - 1)
      .order('created_at', { ascending: false });

    const { data: clients, error: clientsError } = await clientsQuery;

    if (clientsError) throw clientsError;

    if (!clients || clients.length === 0) {
      return {
        data: [],
        count: 0
      };
    }

    // THIRD: Get profile IDs from clients
    const profileIds = clients
      .map(client => client.profile_id)
      .filter(Boolean);

    let profiles = [];
    
    if (profileIds.length > 0) {
      // Get profiles for these clients
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds);

      if (profilesError) {
        console.warn('Failed to fetch profiles:', profilesError);
      } else {
        profiles = profilesData || [];
      }
    }

    // FOURTH: Combine client and profile data manually
    const combinedData = clients.map(client => {
      // Find matching profile
      const profile = profiles.find(p => p.id === client.profile_id) || {};
      
      return {
        // Client data
        id: client.id,
        client_id: client.id,
        profile_id: client.profile_id,
        client_type: client.client_type,
        client_status: client.status,
        client_notes: client.notes,
        client_created_at: client.created_at,
        
        // Profile data (contact information - profile takes precedence)
        email: profile.email || client.email,
        phone: profile.phone || client.phone,
        full_name: profile.full_name || client.full_name,
        first_name: profile.first_name || client.first_name,
        last_name: profile.last_name || client.last_name,
        company: profile.company || client.company,
        country: profile.country || client.country,
        opt_out: profile.opt_out !== undefined ? profile.opt_out : (client.opt_out || false),
        
        // Timestamps
        created_at: client.created_at || profile.created_at,
        updated_at: client.updated_at || profile.updated_at
      };
    });

    // FIFTH: Apply filters and search
    let filtered = applyFiltersAndSearch(combinedData, filters, search);

    return {
      data: filtered,
      count: typeof totalCount === 'number' ? totalCount : filtered.length
    };

  } catch (error) {
    console.error('Error in getClientsWithProfiles:', error);
    throw error;
  }
}

/**
 * Apply filters and search to the data
 */
function applyFiltersAndSearch(data, filters, search) {
  let filtered = [...data];

  // Apply country filter
  if (filters.country) {
    filtered = filtered.filter(item => 
      (item.country || '').toString().toLowerCase() === 
      String(filters.country).toLowerCase()
    );
  }

  // Apply opt-out filter
  if (filters.opt_out === true) {
    filtered = filtered.filter(item => item.opt_out === true);
  }
  if (filters.opt_out === false) {
    filtered = filtered.filter(item => !item.opt_out);
  }

  // Apply search
  if (search && search.trim().length > 0) {
    const searchTerm = search.trim().toLowerCase();
    filtered = filtered.filter(item => {
      const name = (item.full_name || item.name || `${item.first_name || ''} ${item.last_name || ''}`).toString().toLowerCase();
      const email = (item.email || '').toString().toLowerCase();
      const phone = (item.phone || item.mobile || item.phone_number || '').toString().toLowerCase();
      const company = (item.company || item.company_name || '').toString().toLowerCase();
      
      return name.includes(searchTerm) || 
             email.includes(searchTerm) || 
             phone.includes(searchTerm) || 
             company.includes(searchTerm);
    });
  }

  return filtered;
}

/**
 * Fallback: Get only profiles (original function)
 */
export async function getProfiles({ page = 1, pageSize = 25, search = '', filters = {} } = {}) {
  const from = (page - 1) * pageSize;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .range(from, from + pageSize - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    let filtered = Array.isArray(data) ? data.slice() : [];

    // Apply filters
    if (filters.country) {
      filtered = filtered.filter(p => (p.country || '').toString().toLowerCase() === String(filters.country).toLowerCase());
    }

    if (filters.opt_out === true) {
      filtered = filtered.filter(p => p.opt_out === true);
    }
    if (filters.opt_out === false) {
      filtered = filtered.filter(p => !p.opt_out);
    }

    // Apply search
    if (search && search.trim().length > 0) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(p => {
        const name = (p.full_name || p.name || `${p.first_name || ''} ${p.last_name || ''}`).toString().toLowerCase();
        const email = (p.email || '').toString().toLowerCase();
        const phone = (p.phone || p.mobile || p.phone_number || '').toString().toLowerCase();
        const company = (p.company || p.company_name || '').toString().toLowerCase();
        return name.includes(s) || email.includes(s) || phone.includes(s) || company.includes(s);
      });
    }

    return {
      data: filtered,
      count: filtered.length // Since we filtered client-side, count is filtered length
    };

  } catch (error) {
    console.error('Error in getProfiles:', error);
    throw error;
  }
}

/**
 * Get distinct countries from profiles table
 */
export async function getDistinctCountries() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('country')
      .not('country', 'is', null)
      .limit(1000);

    if (error) throw error;
    
    const countriesSet = new Set();
    (data || []).forEach(item => {
      if (item.country) {
        countriesSet.add(item.country);
      }
    });
    
    return Array.from(countriesSet).sort();

  } catch (err) {
    console.error('Failed to get countries from profiles:', err);
    return [];
  }
}

/**
 * Map selected profiles for bulk sending
 */
export function mapSelectedProfiles(selectedItems) {
  return selectedItems.map(item => ({
    // Use both IDs for proper logging
    profile_id: item.profile_id || item.id,
    client_id: item.client_id || item.id,
    
    // Contact information
    full_name: item.full_name || item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
    email: item.email || null,
    phone: item.phone || item.mobile || item.phone_number || null,
    company: item.company || item.company_name || null,
    
    // Preferences
    opt_out: !!item.opt_out,
    
    // Additional data
    client_type: item.client_type,
    country: item.country
  }));
}

/**
 * NEW: Get client by profile ID
 */
export async function getClientByProfileId(profileId) {
  if (!profileId) return null;
  
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle(); // Use maybeSingle to return null instead of error if no record

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('Error in getClientByProfileId:', error);
    return null;
  }
}

/**
 * NEW: Get profile by ID
 */
export async function getProfileById(profileId) {
  if (!profileId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('Error in getProfileById:', error);
    return null;
  }
}