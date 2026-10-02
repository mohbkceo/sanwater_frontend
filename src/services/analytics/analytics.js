import { analyticsAPI } from '../baseAPIs';

const TRACK_URL = `${import.meta.env.VITE_BACK_END_BASE_URL}/analytics/track`;
const LEGACY_NAMES = { page_view: 'page_viewed', product_view: 'product_viewed', article_view: 'article_viewed' };
const BROWSER_NAMES = new Set(['page_viewed', 'product_viewed', 'product_inquiry_started', 'lead_form_started', 'job_viewed', 'job_apply_clicked', 'article_viewed', 'article_product_clicked', 'article_contact_clicked', 'article_reading_progress']);
const CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'ttclid', 'msclkid'];

function acquisition() {
  const query = new URLSearchParams(window.location.search);
  const referrer = (() => { try { const url = new URL(document.referrer); return url.origin !== window.location.origin ? url.origin : null; } catch { return null; } })();
  const result = {
    source: query.get('utm_source'), medium: query.get('utm_medium'), campaign: query.get('utm_campaign'),
    content: query.get('utm_content'), term: query.get('utm_term'), utmId: query.get('utm_id'), referrer,
  };
  for (const id of CLICK_IDS) if (query.has(id)) result[id] = query.get(id);
  return result;
}
function ignore(path) { return /^\/(?:sanwater\/admins|admin|dashboard)(?:\/|$)/i.test(path || ''); }
function subjectFrom(name, meta) {
  if (name.startsWith('article_') && meta?.article_id) return { type: 'article', id: String(meta.article_id) };
  if (meta?.product_id) return { type: 'product', id: String(meta.product_id) };
  if (meta?.article_id) return { type: 'article', id: String(meta.article_id) };
  if (meta?.hiring_id) return { type: 'hiring_position', id: String(meta.hiring_id) };
  return null;
}
function send(name, meta = {}, path = window.location.pathname) {
  if (!BROWSER_NAMES.has(name) || ignore(path)) return;
  const payload = {
    name, path, subject: subjectFrom(name, meta), relatedProductId: name === 'article_product_clicked' ? meta.product_id : undefined, progress: meta.progress,
    acquisition: acquisition(), device: { type: /mobile|android|iphone/i.test(navigator.userAgent) ? 'mobile' : 'desktop', language: navigator.language },
  };
  fetch(TRACK_URL, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
}
export function trackPageView(path) { send('page_viewed', {}, path); }
export function trackCustomEvent(name, meta = {}) { send(LEGACY_NAMES[name] || name, meta, meta.page || window.location.pathname); }
// Browser clicks never represent authoritative commercial conversions.
export function trackConversion() {}
export function trackCTA() {}
export function getAttributionContext() { return { ...acquisition(), pagePath: window.location.pathname }; }

const params = filters => Object.fromEntries(Object.entries(filters || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''));
export async function fetchDashboard(filters) { return (await analyticsAPI.get('/v2/dashboard', { params: params(filters) })).data.data; }
export async function fetchDomain(domain, filters) { return (await analyticsAPI.get(`/v2/${domain}`, { params: params(filters) })).data.data; }
export async function fetchAttention(filters) { return (await analyticsAPI.get('/v2/attention', { params: params(filters) })).data.data; }
export async function fetchSubject(type, id, filters) { return (await analyticsAPI.get(`/v2/subjects/${type}/${id}`, { params: params(filters) })).data.data; }
export async function fetchExplorer(filters) { return (await analyticsAPI.get('/v2/explorer', { params: params(filters) })).data.data; }
export async function fetchAnalytics(filters) { return (await analyticsAPI.get('/summary', { params: params(filters) })).data.data; }
export async function fetchBusinessAnalytics(filters) { return (await analyticsAPI.get('/business', { params: params(filters) })).data.data; }
export async function fetchFunnelBreakdown(filters) { return (await analyticsAPI.get('/business/funnel-breakdown', { params: params(filters) })).data.data; }
