// src/context/SearchContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

const SearchContext = createContext();
export const useSearch = () => useContext(SearchContext);

// Debounce utility
const debounce = (fn, delay = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

const CATEGORY_LIST = [
  'all',
  'products',
  'orders',
  'profiles',
  'clients',
  'suppliers',
  'invoices',
  'shipments',
  'export_orders',
  'categories',
  'notifications',
  'export_timeline',
];

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // one of CATEGORY_LIST
  const [loading, setLoading] = useState(false);

  // Results structure: { category: { items: [], offset: 0, hasMore: boolean } }
  const [results, setResults] = useState({});
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recent_searches') || '[]'); } catch { return []; }
  });
  const [suggestions, setSuggestions] = useState([]);

  const lastQueryRef = useRef('');
  const clearResults = () => {
  setResults({});
   };

  const clearRecentSearches = () => {
  // Implementation to clear recent searches from localStorage/API
  };

  useEffect(() => {
    localStorage.setItem('recent_searches', JSON.stringify(recentSearches.slice(0, 5)));
  }, [recentSearches]);

  const updateSuggestions = async (term) => {
    if (!term || term.length < 2) {
      setSuggestions(recentSearches);
      return;
    }
    // Prefix-only suggestions from products names
    const { data, error } = await supabase
      .from('products')
      .select('name')
      .ilike('name', `${term}%`)
      .limit(5);
    if (!error) {
      const names = (data || []).map(d => d.name);
      setSuggestions(names.length ? names : recentSearches);
    }
  };

  const BASE_LIMIT = 20;

  const buildQueryTasks = (term, currentFilter, offsets) => {
    const tasks = [];
    const addTask = (key, rq) => tasks.push({ key, rq });

    // Products
    if (currentFilter === 'all' || currentFilter === 'products') {
      addTask('products',
        supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%,hs_code.ilike.%${term}%,sku.ilike.%${term}%`)
          .order('updated_at', { ascending: false, nullsFirst: false })
          .range(offsets.products || 0, (offsets.products || 0) + BASE_LIMIT - 1)
      );
    }

    // Orders
    if (currentFilter === 'all' || currentFilter === 'orders') {
      addTask('orders',
        supabase
          .from('orders')
          .select('*')
          .or(`product_name.ilike.%${term}%,status.ilike.%${term}%,invoice_number.ilike.%${term}%,delivery_port.ilike.%${term}%,notes.ilike.%${term}%`)
          .order('created_at', { ascending: false })
          .range(offsets.orders || 0, (offsets.orders || 0) + BASE_LIMIT - 1)
      );
    }

    // Profiles
    if (currentFilter === 'all' || currentFilter === 'profiles') {
      addTask('profiles',
        supabase
          .from('profiles')
          .select('*')
          .or(`full_name.ilike.%${term}%,company_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
          .order('updated_at', { ascending: false })
          .range(offsets.profiles || 0, (offsets.profiles || 0) + BASE_LIMIT - 1)
      );
    }

    // Clients
    if (currentFilter === 'all' || currentFilter === 'clients') {
      addTask('clients',
        supabase
          .from('clients')
          .select('*')
          .or(`business_email.ilike.%${term}%,business_phone.ilike.%${term}%,vat_number.ilike.%${term}%,tax_identification_number.ilike.%${term}%,notes.ilike.%${term}%`)
          .order('updated_at', { ascending: false })
          .range(offsets.clients || 0, (offsets.clients || 0) + BASE_LIMIT - 1)
      );
    }

    // Suppliers
    if (currentFilter === 'all' || currentFilter === 'suppliers') {
      addTask('suppliers',
        supabase
          .from('suppliers')
          .select('*')
          .or(`name.ilike.%${term}%,contact_person.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,product_type.ilike.%${term}%,product_category.ilike.%${term}%`)
          .order('updated_at', { ascending: false })
          .range(offsets.suppliers || 0, (offsets.suppliers || 0) + BASE_LIMIT - 1)
      );
    }

    // Invoices
    if (currentFilter === 'all' || currentFilter === 'invoices') {
      addTask('invoices',
        supabase
          .from('invoices')
          .select('*')
          .or(`invoice_number.ilike.%${term}%,status.ilike.%${term}%`)
          .order('updated_at', { ascending: false })
          .range(offsets.invoices || 0, (offsets.invoices || 0) + BASE_LIMIT - 1)
      );
    }

    // Shipments
    if (currentFilter === 'all' || currentFilter === 'shipments') {
      addTask('shipments',
        supabase
          .from('shipments')
          .select('*')
          .or(`tracking_number.ilike.%${term}%,carrier.ilike.%${term}%,status.ilike.%${term}%`)
          .order('updated_at', { ascending: false })
          .range(offsets.shipments || 0, (offsets.shipments || 0) + BASE_LIMIT - 1)
      );
    }

    // Export orders
    if (currentFilter === 'all' || currentFilter === 'export_orders') {
      addTask('export_orders',
        supabase
          .from('export_orders')
          .select('*')
          .or(`export_reference.ilike.%${term}%,status.ilike.%${term}%,port_of_loading.ilike.%${term}%,port_of_discharge.ilike.%${term}%`)
          .order('updated_at', { ascending: false })
          .range(offsets.export_orders || 0, (offsets.export_orders || 0) + BASE_LIMIT - 1)
      );
    }

    // Categories
    if (currentFilter === 'all' || currentFilter === 'categories') {
      addTask('categories',
        supabase
          .from('categories')
          .select('*')
          .ilike('name', `%${term}%`)
          .order('updated_at', { ascending: false, nullsFirst: true })
          .range(offsets.categories || 0, (offsets.categories || 0) + BASE_LIMIT - 1)
      );
    }

    // Notifications
    if (currentFilter === 'all' || currentFilter === 'notifications') {
      addTask('notifications',
        supabase
          .from('notifications')
          .select('*')
          .ilike('message', `%${term}%`)
          .order('created_at', { ascending: false })
          .range(offsets.notifications || 0, (offsets.notifications || 0) + BASE_LIMIT - 1)
      );
    }

    // Export timeline
    if (currentFilter === 'all' || currentFilter === 'export_timeline') {
      addTask('export_timeline',
        supabase
          .from('export_timeline')
          .select('*')
          .or(`event_type.ilike.%${term}%,event_description.ilike.%${term}%`)
          .order('event_time', { ascending: false })
          .range(offsets.export_timeline || 0, (offsets.export_timeline || 0) + BASE_LIMIT - 1)
      );
    }

    return tasks;
  };

  const runSearchImmediate = async (term) => {
    if (!term || term.trim().length < 2) {
      setResults({});
      setSuggestions(recentSearches);
      return;
    }

    lastQueryRef.current = term;
    setLoading(true);
    await updateSuggestions(term);

    try {
      const offsets = Object.fromEntries(
        CATEGORY_LIST.map(cat => [cat, results[cat]?.offset || 0])
      );

      const tasks = buildQueryTasks(term, filter, offsets);
      const promises = tasks.map(({ key, rq }) => rq.then(({ data, error, count }) => ({ key, data: error ? [] : (data || []) })));
      const responses = await Promise.all(promises);

      const next = { ...results };
      responses.forEach(({ key, data }) => {
        const existing = next[key]?.items || [];
        const newOffset = (next[key]?.offset || 0) + data.length;
        next[key] = {
          items: existing.length && offsets[key] > 0 ? [...existing, ...data] : data,
          offset: newOffset,
          hasMore: data.length === BASE_LIMIT, // if got full page, assume more
        };
      });

      // record recent search
      setRecentSearches(prev => {
        const updated = [term, ...prev.filter(t => t !== term)];
        return updated.slice(0, 5);
      });

      if (lastQueryRef.current === term) {
        setResults(next);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const runSearch = useMemo(() => debounce(runSearchImmediate, 250), [filter]);

  const loadMore = async (category) => {
    if (!searchTerm || !results[category]?.hasMore) return;
    const offsets = { [category]: results[category].offset };
    const tasks = buildQueryTasks(searchTerm, category, offsets);
    const target = tasks.find(t => t.key === category);
    if (!target) return;
    setLoading(true);
    try {
      const { data, error } = await target.rq;
      const appended = error ? [] : (data || []);
      setResults(prev => ({
        ...prev,
        [category]: {
          items: [...(prev[category]?.items || []), ...appended],
          offset: (prev[category]?.offset || 0) + appended.length,
          hasMore: appended.length === BASE_LIMIT,
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    const rows = [];
    Object.entries(results).forEach(([category, group]) => {
      (group?.items || []).forEach(item => rows.push({ category, ...item }));
    });
    if (!rows.length) return;

    const headers = Array.from(
      rows.reduce((set, obj) => {
        Object.keys(obj).forEach(k => set.add(k));
        return set;
      }, new Set())
    );
    const csv = [headers.join(',')].concat(
      rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'search_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF (print-friendly)
  const exportPDF = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const style = `
      <style>
        body { font-family: system-ui, Arial, sans-serif; padding: 16px; }
        h2 { margin-top: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; }
        .category { margin-top: 20px; }
      </style>
    `;
    const sections = Object.entries(results).map(([category, group]) => {
      const items = group?.items || [];
      if (!items.length) return '';
      const cols = Array.from(
        items.reduce((set, obj) => { Object.keys(obj).forEach(k => set.add(k)); return set; }, new Set())
      );
      const head = `<tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>`;
      const body = items.map(row => `<tr>${cols.map(c => `<td>${String(row[c] ?? '')}</td>`).join('')}</tr>`).join('');
      return `<div class="category"><h2>${category}</h2><table>${head}${body}</table></div>`;
    }).join('');

    w.document.write(style + sections);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  return (
    <SearchContext.Provider value={{
      searchTerm, setSearchTerm,
      filter, setFilter,
      results, loading,
      suggestions, recentSearches,
      runSearch, loadMore,
      exportCSV, exportPDF,
    }}>
      {children}
    </SearchContext.Provider>
  );
};
