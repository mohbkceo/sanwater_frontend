const fs = require('node:fs');
const path = require('node:path');
const parser = require('../node_modules/.pnpm/node_modules/@babel/parser');
const traverse = require('../node_modules/.pnpm/node_modules/@babel/traverse').default;
const root = path.resolve(__dirname, '../src');
const catalogFile = path.resolve(__dirname, 'admin-jsx-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf8'));
const scope = ['routes/sanwatergroup', 'components/dashboard', 'components/products/ProductForm.jsx', 'components/products/ProductGalleryUpload.jsx'];
const namespaces = [
  [/\/auth\//, 'auth'], [/\/Analytics\.jsx$/, 'analytics'], [/\/analytics\//, 'analytics'],
  [/\/EditSales\.jsx$/, 'sales'], [/\/HiringManagement\.jsx$/, 'hiring'],
  [/\/LeadsManagementPage\.jsx$/, 'leads'], [/\/QuotationsManagementPage\.jsx$/, 'quotations'],
  [/\/UserManagement\.jsx$/, 'users'], [/\/UserProfile\.jsx$/, 'profile'],
  [/\/News\//, 'news'], [/\/ContactSubmissions\.jsx$/, 'submissions'],
  [/\/ActivityLogs\.jsx$/, 'activity'], [/\/Settings\.jsx$/, 'settings'],
  [/\/Content\.jsx$/, 'content'], [/\/FamiliesControlPage\.jsx$/, 'families'],
  [/\/products\//, 'products'], [/\/components\/products\//, 'products'],
];
function files(p) { return fs.statSync(p).isFile() ? [p] : fs.readdirSync(p).flatMap((name) => files(path.join(p, name))); }
function slug(v) { return v.normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').split('_').slice(0, 9).join('_'); }
let count = 0;
for (const file of scope.flatMap((p) => files(path.join(root, p))).filter((p) => /\.jsx$/.test(p))) {
  let source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const ns = namespaces.find(([re]) => re.test('/' + rel))?.[1] || 'common';
  const ast = parser.parse(source, { sourceType: 'module', plugins: ['jsx'] });
  const edits = [], functions = new Map();
  const keyFor = (value) => {
    if (!catalog[ns]) catalog[ns] = {};
    for (const [key, text] of Object.entries(catalog[ns])) if (text === value) return `admin.${ns}.${key}`;
    let name = slug(value), candidate = name, i = 2;
    while (catalog[ns][candidate] && catalog[ns][candidate] !== value) candidate = `${name}_${i++}`;
    catalog[ns][candidate] = value;
    return `admin.${ns}.${candidate}`;
  };
  const getComponent = (p) => {
    let fn = p.getFunctionParent();
    while (fn) {
      const name = fn.node.id?.name || (fn.parentPath?.isVariableDeclarator() ? fn.parentPath.node.id.name : '');
      if (name && /^[A-Z]/.test(name) && fn.node.body?.type === 'BlockStatement') return fn.node;
      fn = fn.getFunctionParent();
    }
    return null;
  };
  traverse(ast, {
    StringLiteral(p) {
      const value = p.node.value;
      if (!value.trim() || !/[A-Za-z]/.test(value) || value.startsWith('admin.')) return;
      const nearest = p.findParent((ancestor) => ancestor.isJSXExpressionContainer() || ancestor.isJSXAttribute());
      if (!nearest?.isJSXExpressionContainer() || nearest.parentPath?.isJSXAttribute()) return;
      const parent = p.parentPath;
      const direct = parent.isJSXExpressionContainer() || (parent.isConditionalExpression() && (parent.node.consequent === p.node || parent.node.alternate === p.node)) || (parent.isLogicalExpression() && parent.node.right === p.node);
      if (!direct) return;
      const component = getComponent(p);
      if (!component) return;
      functions.set(component.start, component);
      edits.push({ start: p.node.start, end: p.node.end, text: `t(${JSON.stringify(keyFor(value))})` });
      count++;
    },
  });
  if (!edits.length) continue;
  for (const fn of functions.values()) if (!source.slice(fn.body.start, fn.body.end).includes('useTranslation()')) edits.push({ start: fn.body.start + 1, end: fn.body.start + 1, text: '\n  const { t } = useTranslation();' });
  if (!source.includes('useTranslation')) edits.push({ start: 0, end: 0, text: 'import { useTranslation } from "@/lib/i18n";\n' });
  for (const edit of edits.sort((a, b) => b.start - a.start || b.end - a.end)) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  fs.writeFileSync(file, source);
}
fs.writeFileSync(catalogFile, JSON.stringify(catalog, null, 2) + '\n');
console.log(`Migrated ${count} expression literals`);
