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

  
  async function load() {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (filters?.from) params.set("from", filters.from);
        if (filters?.to) params.set("to", filters.to);

        const res = await fetchAnalytics(filters);
        
        
          setData(res || null);
  
      } catch (error) {
        setData(null);
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    load();    
  }, [filters?.from, filters?.to]);

  return { data, loading, load };
}