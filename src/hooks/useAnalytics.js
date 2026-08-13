import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  fetchAnalytics,
  flushPendingEvents,
  identifyAnalyticsUser,
  trackClientError,
  trackPageExit,
  trackPageView,
  trackRouteTiming,
  trackWebVital,
} from '@/services/analytics/analytics';

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const startedAt = performance.now();
    trackPageView(path);
    identifyAnalyticsUser();

    const navigationEntry = performance.getEntriesByType?.('navigation')?.[0];
    if (navigationEntry?.duration && navigationEntry.duration > 0) {
      trackRouteTiming(path, navigationEntry.duration);
    }

    return () => {
      const duration = Math.max(0, Math.round(performance.now() - startedAt));
      trackPageExit(path, duration);
      trackRouteTiming(path, duration);
    };
  }, [location.pathname]);

  useEffect(() => {
    const onError = (event) => trackClientError(event.error || new Error(event.message), 'window');
    const onUnhandledRejection = (event) => trackClientError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), 'unhandled_rejection');
    const onPageHide = () => flushPendingEvents();

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('pagehide', onPageHide);

    const observer = typeof PerformanceObserver === 'undefined' ? null : new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') trackWebVital('LCP', entry.startTime);
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) trackWebVital('CLS', Number(entry.value.toFixed(3)));
        if (entry.entryType === 'event' && entry.name === 'click') trackWebVital('INP', entry.duration);
      });
    });

    try {
      observer?.observe({ type: 'largest-contentful-paint', buffered: true });
      observer?.observe({ type: 'layout-shift', buffered: true });
      observer?.observe({ type: 'event', buffered: true, durationThreshold: 40 });
    } catch {
      // Browser does not support one or more Performance Observer entry types.
    }

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('pagehide', onPageHide);
      observer?.disconnect();
    };
  }, []);
}

export function useFetchAnalytics(filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const from = filters?.from;
  const to = filters?.to;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchAnalytics({ from, to });
      setData(response || null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, load };
}
