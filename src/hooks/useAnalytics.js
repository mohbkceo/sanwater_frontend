import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  trackPageView,
  fetchAnalytics,
  fetchBusinessAnalytics,
  fetchFunnelBreakdown,
} from "@/services/analytics/analytics";



export  function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);
}



export function useFetchAnalytics(filters) {
  const from = filters?.from;
  const to = filters?.to;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchAnalytics({ from, to });
        setData(res || null);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
  }, [from, to]);

  useEffect(() => {
    load();    
  }, [load]);

  return { data, loading, error, load };
}

export function useBusinessAnalytics(filters) {
  const from = filters?.from;
  const to = filters?.to;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await fetchBusinessAnalytics({ from, to }));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, load };
}

export function useFunnelBreakdown(filters, stage, dimension) {
  const from = filters?.from;
  const to = filters?.to;
  const requestKey = stage ? `${from || ""}|${to || ""}|${stage}|${dimension}` : null;
  const [state, setState] = useState({ data: null, error: null, key: null });
  useEffect(() => {
    if (!stage) {
      return undefined;
    }
    let active = true;
    fetchFunnelBreakdown({ from, to, stage, dimension })
      .then((data) => active && setState({ data, error: null, key: requestKey }))
      .catch((error) => active && setState({ data: null, error, key: requestKey }));
    return () => { active = false; };
  }, [from, to, stage, dimension, requestKey]);
  return {
    data: state.key === requestKey ? state.data : null,
    error: state.key === requestKey ? state.error : null,
    loading: Boolean(stage && state.key !== requestKey),
  };
}
