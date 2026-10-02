import test from 'node:test';
import assert from 'node:assert/strict';
import { orderSections, rangeForDays, subjectRoute, updateRangeParams } from '../src/components/dashboard/intelligence/routing.js';

test('persona changes navigation priority without changing which sections exist', () => {
  const sections = ['admin.nav.system', 'Marketing', 'Intelligence', 'admin.nav.catalog', 'admin.nav.operations', 'admin.nav.overview'].map(label => ({ label }));
  const ordered = orderSections(sections, 'product_manager');
  assert.equal(ordered[0].label, 'admin.nav.overview');
  assert.equal(ordered[1].label, 'admin.nav.catalog');
  assert.deepEqual(new Set(ordered), new Set(sections));
  assert.equal(orderSections(sections, 'general_admin'), sections);
});

test('date presets use UTC dates and filters survive unrelated query state', () => {
  assert.deepEqual(rangeForDays(7, new Date('2026-10-02T12:00:00Z')), { from: '2026-09-26', to: '2026-10-02' });
  const changed = updateRangeParams(new URLSearchParams('classification=hidden_opportunity&from=2026-09-01'), { from: '2026-09-10', to: '2026-09-30' });
  assert.equal(changed.get('classification'), 'hidden_opportunity');
  assert.equal(changed.get('from'), '2026-09-10');
  assert.equal(changed.get('to'), '2026-09-30');
});

test('subject drilldown carries URL filter state', () => {
  assert.equal(subjectRoute('/admin/subjects', 'product', 'abc', '?from=2026-09-01'), '/admin/subjects/product/abc?from=2026-09-01');
});
