const fs = require('node:fs');
const path = require('node:path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '../src');
const roots = [
  'routes/sanwatergroup',
  'components/dashboard',
  'components/products/ProductForm.jsx',
  'components/products/ProductGalleryUpload.jsx',
  'components/products/ProductCard.jsx',
  'components/products/ProductNotFound.jsx',
  'components/news/RichTextEditor.jsx',
  'components/news/ArticleContent.jsx',
  'components/shared_uis/NoPermission.jsx',
  'layouts/DashboardLayout.jsx',
];
const visibleAttributes = new Set(['placeholder', 'title', 'aria-label', 'alt', 'label', 'description', 'subtitle', 'helperText', 'emptyText', 'hint', 'tooltip']);
const ignored = /^(?:[-–—…\s\d.,/:+×*?%!#]+|https?:\/\/\S+|\/\S+|[A-Z]{2,6}|[A-Z]{2,6}-\d{4}-\d+|(?:[a-z]+-[\w/.-]+\s*){2,})$/;
function files(target) {
  if (fs.statSync(target).isFile()) return [target];
  return fs.readdirSync(target).flatMap((name) => files(path.join(target, name)));
}
const findings = [];
const referencedKeys = new Set();
const literalCalls = [];
for (const file of roots.flatMap((part) => files(path.join(root, part))).filter((name) => /\.[jt]sx?$/.test(name))) {
  const source = fs.readFileSync(file, 'utf8');
  const ast = parser.parse(source, { sourceType: 'module', plugins: ['jsx'] });
  const add = (node, kind, value) => {
    const text = value.trim().replace(/\s+/g, ' ');
    if (!text || ignored.test(text) || !/[\p{L}]/u.test(text)) return;
    findings.push({ file: path.relative(root, file).replaceAll('\\', '/'), line: node.loc.start.line, kind, text });
  };
  traverse(ast, {
    CallExpression(p) {
      if (p.node.callee.name === 't' && p.node.arguments[0]?.type === 'StringLiteral' && p.node.arguments[0].value.startsWith('admin.')) {
        literalCalls.push({ key: p.node.arguments[0].value.slice(6), hasVariables: p.node.arguments.length > 1, file: path.relative(root, file).replaceAll('\\', '/'), line: p.node.loc.start.line });
      }
      if (process.argv.includes('--check') && p.node.callee.type === 'MemberExpression' && p.node.callee.object.name === 'toast') {
        const message = p.node.arguments[0];
        if (message?.type === 'StringLiteral') add(message, 'toast', message.value);
        if (message?.type === 'TemplateLiteral') add(message, 'toast', message.quasis.map((q) => q.value.raw).join('{{value}}'));
      }
    },
    JSXText(p) { add(p.node, 'jsx', p.node.value); },
    JSXAttribute(p) {
      const name = p.node.name.name;
      if (visibleAttributes.has(name) && p.node.value?.type === 'StringLiteral') add(p.node, name, p.node.value.value);
      if (visibleAttributes.has(name) && p.node.value?.expression?.type === 'TemplateLiteral')
        add(p.node, name, p.node.value.expression.quasis.map((q) => q.value.raw).join('{{value}}'));
    },
    StringLiteral(p) {
      if (/^admin\.[\w.]+$/.test(p.node.value)) referencedKeys.add(p.node.value);
      if (process.argv.includes('--check')) {
        const nearest = p.findParent((parent) => parent.isJSXExpressionContainer() || parent.isJSXAttribute());
        if (!nearest?.isJSXExpressionContainer() || nearest.parentPath?.isJSXAttribute()) return;
        const parent = p.parentPath;
        const direct = parent.isJSXExpressionContainer() ||
          (parent.isConditionalExpression() && (parent.node.consequent === p.node || parent.node.alternate === p.node)) ||
          (parent.isLogicalExpression() && parent.node.right === p.node);
        if (direct && (/[A-Z]/.test(p.node.value) || /\s/.test(p.node.value))) add(p.node, 'expression', p.node.value);
        return;
      }
      if (process.argv.includes('--all')) {
        const v = p.node.value;
        if (!/\s/.test(v) || !/[A-Za-z]{3}/.test(v) || v.startsWith('admin.') || /^(?:[a-z0-9-]+\s)+(?:[a-z0-9-/]+)$/.test(v)) return;
        if (p.findParent((parent) => parent.isCallExpression() && parent.node.callee.name === 't')) return;
        const attr = p.findParent((parent) => parent.isJSXAttribute());
        if (attr && !visibleAttributes.has(attr.node.name.name)) return;
        add(p.node, 'literal', v);
        return;
      }
      if (!process.argv.includes('--deep')) return;
      const nearest = p.findParent((parent) => parent.isJSXExpressionContainer() || parent.isJSXAttribute());
      if (!nearest?.isJSXExpressionContainer() || nearest.parentPath?.isJSXAttribute()) return;
      if (p.findParent((parent) => parent.isCallExpression() && parent.node.callee.name === 't')) return;
      add(p.node, 'expression', p.node.value);
    },
    TemplateLiteral(p) {
      if (!process.argv.includes('--deep')) return;
      const nearest = p.findParent((parent) => parent.isJSXExpressionContainer() || parent.isJSXAttribute());
      if (!nearest?.isJSXExpressionContainer() || nearest.parentPath?.isJSXAttribute()) return;
      add(p.node, 'template', p.node.quasis.map((q) => q.value.raw).join('{{value}}'));
    },
  });
}
if (process.argv.includes('--check')) {
  (async () => {
    const { adminTranslations } = await import(pathToFileURL(path.join(root, 'lib/i18n_admin.js')).href);
    const flatten = (object, prefix = '') => Object.entries(object).flatMap(([key, value]) =>
      typeof value === 'string' ? [[`${prefix}${key}`, value]] : flatten(value, `${prefix}${key}.`));
    const entries = Object.fromEntries(['en', 'fr', 'ar'].map((lang) => [lang, new Map(flatten(adminTranslations[lang]))]));
    const keys = [...entries.en.keys()];
    for (const lang of ['fr', 'ar']) {
      for (const key of keys) if (!entries[lang].has(key)) findings.push({ file: 'lib/i18n_admin.js', line: 1, kind: 'missing-locale-key', text: `${lang} admin.${key}` });
      for (const key of entries[lang].keys()) if (!entries.en.has(key)) findings.push({ file: 'lib/i18n_admin.js', line: 1, kind: 'extra-locale-key', text: `${lang} admin.${key}` });
    }
    const vars = (value) => [...value.matchAll(/\{\{(\w+)\}\}/g)].map((item) => item[1]).sort().join(',');
    for (const key of keys) for (const lang of ['fr', 'ar']) {
      if (entries[lang].has(key) && vars(entries.en.get(key)) !== vars(entries[lang].get(key)))
        findings.push({ file: 'lib/i18n_admin.js', line: 1, kind: 'interpolation', text: `${lang} admin.${key}` });
    }
    for (const fullKey of referencedKeys) {
      const key = fullKey.slice('admin.'.length);
      if (!entries.en.has(key)) findings.push({ file: 'admin source', line: 1, kind: 'missing-key', text: fullKey });
    }
    for (const call of literalCalls) {
      if (entries.en.has(call.key) && vars(entries.en.get(call.key)) && !call.hasVariables) {
        findings.push({ file: call.file, line: call.line, kind: 'missing-interpolation', text: `admin.${call.key}` });
      }
    }
    for (const item of findings) console.log(`${item.file}:${item.line} [${item.kind}] ${item.text}`);
    console.log(`Admin i18n: ${keys.length} keys per locale, ${referencedKeys.size} static references, ${findings.length} issues`);
    if (findings.length) process.exitCode = 1;
  })().catch((error) => { console.error(error); process.exitCode = 1; });
  return;
}
if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(findings, null, 2));
else {
  for (const item of findings) console.log(`${item.file}:${item.line} [${item.kind}] ${item.text}`);
  console.log(`\n${findings.length} obvious visible JSX/attribute strings`);
}
