import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { updateRangeParams } from './routing';

export function useReport(loader, key) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const loaderRef = useRef(loader);
  const requestRef = useRef(0);
  loaderRef.current = loader;
  const load = useCallback(async (clear = false) => {
    const request = ++requestRef.current;
    setState(current => ({ data: clear ? null : current.data, loading: true, error: null }));
    try { const data = await loaderRef.current(); if (request === requestRef.current) setState({ data, loading: false, error: null }); }
    catch (error) { if (request === requestRef.current) setState(current => ({ ...current, loading: false, error })); }
  }, []);
  useEffect(() => { load(true); return () => { requestRef.current += 1; }; }, [load, key]);
  return { ...state, retry: () => load() };
}
export function useAnalyticsRange() {
  const [params, setParams] = useSearchParams();
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const setRange = (next) => setParams(current => updateRangeParams(current, next));
  return { from, to, setRange };
}
