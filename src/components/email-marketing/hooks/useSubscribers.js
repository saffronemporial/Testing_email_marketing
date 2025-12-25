import { useCallback, useEffect, useState } from "react";
import {
  fetchSubscribers,
  bulkUpdateStatus,
} from "../services/subscriber.service";

export default function useSubscribers() {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSubscribers({ page, ...filters });
      setData(res.data);
      setCount(res.count);
    } catch (e) {
      setError("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const bulkStatus = async (status) => {
    await bulkUpdateStatus(selectedIds, status);
    setSelectedIds([]);
    load();
  };

  return {
    data,
    count,
    page,
    setPage,
    filters,
    setFilters,
    loading,
    error,
    reload: load,
    selectedIds,
    setSelectedIds,
    bulkStatus,
  };
}
