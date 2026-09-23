const fs = require('node:fs');
const path = require('node:path');
const parser = require('../node_modules/.pnpm/node_modules/@babel/parser');
const traverse = require('../node_modules/.pnpm/node_modules/@babel/traverse').default;

const root = path.resolve(__dirname, '../src');
const scope = [
  'routes/sanwatergroup', 'components/dashboard',
  'components/products/ProductForm.jsx', 'components/products/ProductGalleryUpload.jsx',
  'components/products/ProductNotFound.jsx', 'components/products/ProductCard.jsx',
  'layouts/DashboardLayout.jsx',
];
const attributes = new Set(['placeholder', 'title', 'aria-label', 'alt', 'label', 'description', 'helperText', 'emptyText']);
const technical = /^(?:[-–—…\s\d.,/:+×*?%!#]+|https?:\/\/\S+|[A-Z]{2,6}|\/\S+|[\w-]+\.(?:svg|png|jpg))$/;
const namespaces = [
  [/\/auth\//, 'auth'], [/\/Analytics\.jsx$/, 'analytics'], [/\/analytics\//, 'analytics'],
  [/\/EditSales\.jsx$/, 'sales'], [/\/HiringManagement\.jsx$/, 'hiring'],
  [/\/LeadsManagementPage\.jsx$/, 'leads'], [/\/QuotationsManagementPage\.jsx$/, 'quotations'],
  [/\/UserManagement\.jsx$/, 'users'], [/\/UserProfile\.jsx$/, 'profile'],
  [/\/News\//, 'news'], [/\/ContactSubmissions\.jsx$/, 'submissions'],
  [/\/ActivityLogs\.jsx$/, 'activity'], [/\/Settings\.jsx$/, 'settings'],
  [/\/Content\.jsx$/, 'content'], [/\/FamiliesControlPage\.jsx$/, 'families'],
  [/\/products\//, 'products'], [/\/components\/products\//, 'products'],
  [/\/Sidebar\.jsx$/, 'nav'], [/\/Topbar\.jsx$/, 'shell'],
];
function files(target) { return fs.statSync(target).isFile() ? [target] : fs.readdirSync(target).flatMap((n) => files(path.join(target, n))); }
function slug(value) {
  return value.normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').split('_').slice(0, 9).join('_');
}
const catalog = {};
const keysByText = {};
const unresolved = [];
for (const file of scope.flatMap((p) => files(path.join(root, p))).filter((p) => /\.jsx$/.test(p))) {
  let source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const ns = namespaces.find(([re]) => re.test('/' + rel))?.[1] || 'common';
  const ast = parser.parse(source, { sourceType: 'module', plugins: ['jsx'] });
  const edits = [];
  const functions = new Map();
  const getComponent = (p) => {
    let fn = p.getFunctionParent();
    while (fn) {
      const n = fn.node;
      const name = n.id?.name || (fn.parentPath?.isVariableDeclarator() ? fn.parentPath.node.id.name : '');
      if (name && /^[A-Z]/.test(name) && n.body?.type === 'BlockStatement') return fn;
      fn = fn.getFunctionParent();
    }
    return null;
  };
  const keyFor = (value) => {
    const text = value.trim().replace(/\s+/g, ' ');
    if (!text || technical.test(text) || !/[\p{L}]/u.test(text)) return null;
    const id = ns + '\0' + text;
    if (keysByText[id]) return keysByText[id];
    let name = slug(text);
    if (!name) return null;
    if (!catalog[ns]) catalog[ns] = {};
    let candidate = name, i = 2;
    while (catalog[ns][candidate] && catalog[ns][candidate] !== text) candidate = `${name}_${i++}`;
    catalog[ns][candidate] = text;
    keysByText[id] = `admin.${ns}.${candidate}`;
    return keysByText[id];
  };
  const queue = (p, value, start, end, before = '', after = '') => {
    const key = keyFor(value);
    if (!key) return;
    const component = getComponent(p);
    if (!component) { unresolved.push(`${rel}:${p.node.loc.start.line} ${value.trim()}`); return; }
    functions.set(component.node.start, component.node);
    edits.push({ start, end, text: `${before}t(${JSON.stringify(key)})${after}` });
  };
  traverse(ast, {
    JSXText(p) {
      // Babel normalizes line endings in JSXText.value. Source offsets must
      // come from the original slice, especially in CRLF worktrees.
      const raw = source.slice(p.node.start, p.node.end);
      const core = raw.trim();
      if (!core) return;
      const start = p.node.start + raw.indexOf(core);
      queue(p, core, start, start + core.length, '{', '}');
    },
    JSXAttribute(p) {
      const name = p.node.name.name;
      if (!attributes.has(name) || p.node.value?.type !== 'StringLiteral') return;
      queue(p, p.node.value.value, p.node.value.start, p.node.value.end, '{', '}');
    },
  });
  if (!edits.length) continue;
  for (const fn of functions.values()) {
    const body = fn.body;
    const hasHook = source.slice(body.start, body.end).includes('useTranslation()');
    if (!hasHook) edits.push({ start: body.start + 1, end: body.start + 1, text: '\n  const { t } = useTranslation();' });
  }
  if (!source.includes('useTranslation')) {
    edits.push({ start: 0, end: 0, text: 'import { useTranslation } from "@/lib/i18n";\n' });
  } else if (!source.includes('import { useTranslation }') && !source.includes(', useTranslation }')) {
    // Existing grouped imports are inspected in the final audit.
    unresolved.push(`${rel}: existing useTranslation import needs review`);
  }
  for (const edit of edits.sort((a, b) => b.start - a.start || b.end - a.end)) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  fs.writeFileSync(file, source);
}
fs.writeFileSync(path.resolve(__dirname, 'admin-jsx-catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
console.log(`Migrated ${Object.values(catalog).reduce((n, x) => n + Object.keys(x).length, 0)} distinct strings`);
console.log('Unresolved:\n' + unresolved.join('\n'));
