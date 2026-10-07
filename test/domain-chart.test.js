import test from 'node:test';
import assert from 'node:assert/strict';
import { chartDataForDomain } from '../src/components/dashboard/intelligence/domainChartData.js';

test('domain charts use the report breakdown for the chosen metric', () => {
  const report = { rows: [
    { product: 'Mixer A', uniqueViews: 8, revenue: 500 },
    { product: 'Mixer B', uniqueViews: 20, revenue: 120 },
  ] };
  assert.deepEqual(chartDataForDomain('products', report, 'uniqueViews'), [
    { label: 'Mixer B', value: 20 }, { label: 'Mixer A', value: 8 },
  ]);
  assert.deepEqual(chartDataForDomain('products', report, 'revenue'), [
    { label: 'Mixer A', value: 500 }, { label: 'Mixer B', value: 120 },
  ]);
});

test('domain charts omit missing values and limit long rankings', () => {
  const report = { sourceQuality: [
    { source: 'direct', visitors: 10 },
    { source: 'search', visitors: 25 },
    { source: 'unknown', visitors: null },
  ] };
  assert.deepEqual(chartDataForDomain('marketing', report, 'visitors', 1), [{ label: 'search', value: 25 }]);
  assert.deepEqual(chartDataForDomain('marketing', report, 'revenue'), []);
  assert.deepEqual(chartDataForDomain('sales', report, 'count'), []);
});
