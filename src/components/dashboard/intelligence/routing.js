const orders = {
  product_manager: ['admin.nav.overview', 'admin.nav.catalog', 'Intelligence', 'admin.nav.operations', 'Marketing', 'admin.nav.system'],
  marketing_manager: ['admin.nav.overview', 'Marketing', 'Intelligence', 'admin.nav.catalog', 'admin.nav.operations', 'admin.nav.system'],
  hiring_manager: ['admin.nav.overview', 'admin.nav.operations', 'Intelligence', 'admin.nav.catalog', 'Marketing', 'admin.nav.system'],
  sales_manager: ['admin.nav.overview', 'admin.nav.operations', 'Intelligence', 'Marketing', 'admin.nav.catalog', 'admin.nav.system'],
  content_manager: ['admin.nav.overview', 'admin.nav.system', 'Intelligence', 'Marketing', 'admin.nav.catalog', 'admin.nav.operations'],
};
export function orderSections(sections, persona) {
  const order = orders[persona];
  return order ? [...sections].sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label)) : sections;
}
export function updateRangeParams(current, next) {
  const params = new URLSearchParams(current);
  for (const key of ['from', 'to']) next[key] ? params.set(key, next[key]) : params.delete(key);
  return params;
}
export function rangeForDays(days, now = new Date()) {
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return { from: start.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) };
}
export function subjectRoute(base, type, id, search = '') {
  return `${base}/${encodeURIComponent(type)}/${encodeURIComponent(id)}${search}`;
}
