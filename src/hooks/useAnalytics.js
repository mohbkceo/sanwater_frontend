import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView, fetchAnalytics } from "@/services/analytics/analytics";



export  function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);
}



export function useFetchAnalytics(filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (filters?.from) params.set("from", filters.from);
        if (filters?.to) params.set("to", filters.to);

        const res = await fetchAnalytics(filters);
        
        if (active) {
          setData(res || null);
        }
      } catch (error) {
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    
  }, [filters?.from, filters?.to]);

  return { data, loading };
}