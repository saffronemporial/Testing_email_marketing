// src/context/SelectedClientContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

/**
 * SelectedClientContext
 * - Stores selected single client (selectedClient) and multi-selection (selectedClients)
 * - Methods to select single, toggle multi-select, clear selection, open picker modal (UI must implement modal toggling)
 *
 * Usage:
 *  const { selectedClient, setSelectedClient, selectedClients, toggleClientSelection } = useSelectedClients();
 */

const SelectedClientContext = createContext();

export function SelectedClientProvider({ children, initialClient = null }) {
  const [selectedClient, setSelectedClient] = useState(initialClient);
  const [selectedClients, setSelectedClients] = useState([]); // for multi-select
  const [allClientsCache, setAllClientsCache] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    // optional auto-load some clients for quick picker
    (async function load() {
      setLoadingClients(true);
      try {
        const { data } = await supabase
          .from("client_complete_info")
          .select("profile_id, client_id, full_name, company_name, email, phone")
          .order("full_name", { ascending: true })
          .limit(2000);
        setAllClientsCache(data || []);
      } catch (err) {
        console.warn("load clients cache error", err);
        setAllClientsCache([]);
      } finally {
        setLoadingClients(false);
      }
    })();
  }, []);

  function clearSelection() {
    setSelectedClient(null);
    setSelectedClients([]);
  }

  function setSingleClient(clientObj) {
    setSelectedClient(clientObj);
    // also ensure it is included in multi-select as single
    setSelectedClients(clientObj ? [clientObj] : []);
  }

  function toggleClientSelection(clientObj) {
    if (!clientObj) return;
    const exists = selectedClients.some((c) => c.profile_id === clientObj.profile_id);
    if (exists) setSelectedClients(selectedClients.filter((c) => c.profile_id !== clientObj.profile_id));
    else setSelectedClients([...selectedClients, clientObj]);
  }

  function setClientsBulk(clientsArray) {
    setSelectedClients(clientsArray || []);
    if ((clientsArray || []).length === 1) setSelectedClient(clientsArray[0]);
  }

  return (
    <SelectedClientContext.Provider value={{
      selectedClient,
      setSelectedClient,
      selectedClients,
      setClientsBulk,
      toggleClientSelection,
      clearSelection,
      allClientsCache,
      loadingClients
    }}>
      {children}
    </SelectedClientContext.Provider>
  );
}

export function useSelectedClients() {
  const ctx = useContext(SelectedClientContext);
  if (!ctx) throw new Error("useSelectedClients must be used inside SelectedClientProvider");
  return ctx;
}
