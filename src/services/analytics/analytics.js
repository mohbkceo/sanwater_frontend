import { analyticsAPI } from '../baseAPIs';

const analyticsBaseUrl = `${import.meta.env.VITE_BACK_END_BASE_URL}/analytics`;
const TRACK_URL = `${analyticsBaseUrl}/track`;
const BATCH_URL = `${analyticsBaseUrl}/batch`;
const IDENTIFY_URL = `${analyticsBaseUrl}/identify`;

const SESSION_KEY = 'sanwater_analytics_session';
const VISITOR_KEY = 'sanwater_analytics_visitor';
const FIRST_TOUCH_KEY = 'sanwater_analytics_first_touch';
const LAST_TOUCH_KEY = 'sanwater_analytics_last_touch';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_PENDING_EVENTS = 50;
const BOT_REGEX = /bot|crawler|spider|crawling|facebookexternalhit|slackbot|whatsapp/i;

let pendingEvents = [];
let flushTimer = null;

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Analytics storage should never affect the application.
  }
}

function generateId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getVisitorId() {
  let visitorId = safeStorageGet(VISITOR_KEY);
  if (!visitorId) {
    visitorId = generateId();
    safeStorageSet(VISITOR_KEY, visitorId);
  }
  return visitorId;
}

function getSessionId() {
  const now = Date.now();
  const stored = safeStorageGet(SESSION_KEY);
  let session;

  try {
    session = stored ? JSON.parse(stored) : null;
  } catch {
    session = null;
  }

  // Supports the application's former string-only session ID during the migration.
  if (typeof session === 'string') session = { id: session, lastActivity: now };
  if (!session?.id || now - Number(session.lastActivity || 0) > SESSION_TIMEOUT_MS) {
    session = { id: generateId(), startedAt: now, lastActivity: now };
  } else {
    session.lastActivity = now;
  }

  safeStorageSet(SESSION_KEY, JSON.stringify(session));
  return session.id;
}

function normalizeString(value, limit = 150) {
  return typeof value === 'string' ? value.trim().slice(0, limit) || null : null;
}

function parseUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    source: normalizeString(params.get('utm_source'), 100),
    medium: normalizeString(params.get('utm_medium'), 100),
    campaign: normalizeString(params.get('utm_campaign'), 150),
    term: normalizeString(params.get('utm_term'), 150),
    content: normalizeString(params.get('utm_content'), 150),
  };
}

function inferSource() {
  const referrer = document.referrer;
  if (!referrer) return 'direct';

  try {
    const hostname = new URL(referrer).hostname.toLowerCase();
    if (/google|bing|yahoo|duckduckgo/.test(hostname)) return 'search';
    if (/facebook|instagram|tiktok|linkedin|twitter|x\.com/.test(hostname)) return 'social';
    return 'referral';
  } catch {
    return 'referral';
  }
}

function captureAttribution(pathname) {
  const utm = parseUTMParams();
  const hasUtm = Object.values(utm).some(Boolean);
  const touch = {
    source: utm.source || inferSource(),
    medium: utm.medium,
    campaign: utm.campaign,
    term: utm.term,
    content: utm.content,
    referrer: normalizeString(document.referrer, 500),
    landingPath: pathname || window.location.pathname,
    capturedAt: new Date().toISOString(),
  };

  let firstTouch;
  try {
    firstTouch = JSON.parse(safeStorageGet(FIRST_TOUCH_KEY) || 'null');
  } catch {
    firstTouch = null;
  }

  if (!firstTouch) {
    firstTouch = touch;
    safeStorageSet(FIRST_TOUCH_KEY, JSON.stringify(firstTouch));
  }

  // Direct internal navigation must not overwrite attributable acquisition context.
  if (hasUtm || touch.referrer) safeStorageSet(LAST_TOUCH_KEY, JSON.stringify(touch));
  let lastTouch;
  try {
    lastTouch = JSON.parse(safeStorageGet(LAST_TOUCH_KEY) || 'null');
  } catch {
    lastTouch = null;
  }

  return { firstTouch, lastTouch: lastTouch || firstTouch || touch };
}

function getDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (BOT_REGEX.test(userAgent)) return 'bot';
  if (/tablet|ipad/i.test(userAgent)) return 'tablet';
  if (/mobile|android|iphone/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

function getBrowser() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  return 'Unknown';
}

function getOS() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  if (userAgent.includes('Mac')) return 'MacOS';
  if (userAgent.includes('Linux')) return 'Linux';
  return 'Unknown';
}

function baseEvent(pathname = window.location.pathname) {
  const attribution = captureAttribution(pathname);
  return {
    event_id: generateId(),
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    source: attribution.lastTouch?.source || 'direct',
    medium: attribution.lastTouch?.medium || null,
    campaign: attribution.lastTouch?.campaign || null,
    term: attribution.lastTouch?.term || null,
    content: attribution.lastTouch?.content || null,
    referrer: normalizeString(document.referrer, 500),
    path: pathname,
    title: normalizeString(document.title, 300),
    user_agent: navigator.userAgent,
    device: getDevice(),
    browser: getBrowser(),
    os: getOS(),
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
    screen: { width: window.screen?.width, height: window.screen?.height },
    ts: new Date().toISOString(),
  };
}

function postEvent(event) {
  try {
    const payload = JSON.stringify(event);
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(TRACK_URL, new Blob([payload], { type: 'application/json' }));
      if (sent) return;
    }

    fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: payload,
      keepalive: true,
    }).catch(() => queueEvent(event));
  } catch {
    queueEvent(event);
  }
}

function queueEvent(event) {
  pendingEvents = [...pendingEvents.slice(-(MAX_PENDING_EVENTS - 1)), event];
  if (!flushTimer) {
    flushTimer = window.setTimeout(() => {
      flushTimer = null;
      flushPendingEvents();
    }, 3000);
  }
}

export function flushPendingEvents() {
  if (!pendingEvents.length) return;
  const events = pendingEvents.splice(0, MAX_PENDING_EVENTS);
  fetch(BATCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ events }),
    keepalive: true,
  }).catch(() => {
    pendingEvents = [...events, ...pendingEvents].slice(-MAX_PENDING_EVENTS);
  });
}

export function trackEvent(type, properties = {}, options = {}) {
  if (getDevice() === 'bot') return;
  postEvent({
    ...baseEvent(options.path || window.location.pathname),
    type,
    duration_ms: options.durationMs ?? null,
    properties,
  });
}

function trackRouteSpecificEvent(path) {
  if (path === '/products') trackEvent('product_list_view', { feature: 'product_catalog' }, { path });
  else if (path.startsWith('/products/')) trackEvent('product_view', { feature: 'product_detail', product_slug: path.split('/').pop() }, { path });
  else if (path === '/hiring') trackEvent('hiring_list_view', { feature: 'hiring' }, { path });
  else if (path === '/news') trackEvent('news_list_view', { feature: 'news' }, { path });
  else if (path.startsWith('/news/')) trackEvent('news_article_view', { feature: 'news_article', article_slug: path.split('/').pop() }, { path });
  else if (path.startsWith('/sanwater/admins/secure')) trackEvent('admin_feature_viewed', { feature: path, route: path }, { path });
}

export function trackPageView(path) {
  if (!path || path.startsWith('/sanwater/admins/secure/auth')) return;
  trackEvent('page_view', { route: path, feature: path.startsWith('/sanwater/admins/secure') ? 'admin_dashboard' : 'public_site' }, { path });
  trackRouteSpecificEvent(path);
}

export function trackPageExit(path, durationMs) {
  if (!path || path.startsWith('/sanwater/admins/secure/auth')) return;
  trackEvent('page_exit', { route: path }, { path, durationMs });
}

export function trackRouteTiming(path, durationMs) {
  trackEvent('route_timing', { route: path, duration_ms: Math.round(durationMs) }, { path, durationMs: Math.round(durationMs) });
}

export function trackCTA(name, properties = {}) {
  trackEvent('cta_click', { action: name, ...properties });
}

export function trackFeatureUsage(feature, action = 'used', properties = {}) {
  trackEvent('feature_usage', { feature, action, ...properties });
}

export function trackFormStarted(form, fieldCount) {
  trackEvent('contact_form_started', { form, form_field_count: fieldCount });
}

export function trackFormSubmitted(form, fieldCount) {
  trackEvent('contact_form_submitted', { form, form_field_count: fieldCount, result: 'success' });
}

export function trackFormFailed(form, statusCode) {
  trackEvent('contact_form_failed', { form, status_code: statusCode || 0, result: 'failure' });
}

export function trackClientError(error, component = 'window') {
  const message = normalizeString(error?.message || String(error), 180)?.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[redacted-email]');
  trackEvent('client_error', { component, error_name: normalizeString(error?.name || 'Error', 80), error_message: message || 'Unknown client error' });
}

export function trackApiFailure({ method, status, url }) {
  const route = normalizeString(url?.replace(import.meta.env.VITE_BACK_END_BASE_URL || '', ''), 300);
  if (route?.startsWith('/analytics')) return;
  trackEvent('api_failure', { method: normalizeString(method?.toUpperCase(), 20), status_code: Number(status) || 0, route: route || 'unknown' });
}

export function trackWebVital(name, value, rating) {
  trackEvent('web_vital', { metric_name: name, metric_value: Math.round(value), rating: normalizeString(rating, 30) });
}

export function identifyAnalyticsUser() {
  const visitorId = getVisitorId();
  fetch(IDENTIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ visitor_id: visitorId }),
    keepalive: true,
  }).catch(() => {});
}

export async function fetchAnalytics({ from, to } = {}) {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const response = await analyticsAPI.get(params.toString() ? `/summary?${params}` : '/summary');
  return response.data?.data || null;
}
