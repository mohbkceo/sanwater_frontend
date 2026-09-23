const fs = require('node:fs');
const path = require('node:path');
const catalogFile = 'scripts/admin-jsx-catalog.json';
const catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf8'));
const names = {
  'news.title_2': 'news.version_field_title',
  'news.status_2': 'news.version_field_status',
  'news.excerpt_2': 'news.version_field_excerpt',
  'news.title_3': 'news.article_title_column',
  'news.featured_2': 'news.featured_badge',
  'users.permissions_2': 'users.permissions_column',
  'families.products_2': 'families.products_label',
  'families.sub_families_2': 'families.sub_families_count_label',
  'families.products_3': 'families.product_count_label',
  'families.unassigned_2': 'families.unassigned_indicator',
  'products.delete_product_2': 'products.delete_product_action',
  'products.products_2': 'products.product_count_plural',
  'quotations.total_requests_2': 'quotations.total',
};
const root = 'src';
function walk(dir) { return fs.readdirSync(dir).flatMap((name) => { const p = path.join(dir, name); return fs.statSync(p).isDirectory() ? walk(p) : [p]; }); }
for (const file of walk(root).filter((p) => /\.[jt]sx?$/.test(p))) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const [before, after] of Object.entries(names)) content = content.replaceAll(`admin.${before}`, `admin.${after}`);
  if (content !== original) fs.writeFileSync(file, content);
}
for (const [before, after] of Object.entries(names)) {
  const [ns, key] = before.split('.');
  const [toNs, toKey] = after.split('.');
  if (catalog[ns]?.[key] !== undefined) {
    if (after !== 'quotations.total') catalog[toNs][toKey] = catalog[ns][key];
    delete catalog[ns][key];
  }
}
delete catalog.sales.from_cyan_500_20_to_blue_600_20;
delete catalog.products.sn_2025_001;
fs.writeFileSync(catalogFile, JSON.stringify(catalog, null, 2) + '\n');
