import test from 'node:test';
import assert from 'node:assert/strict';
import { exportShippingCsv, importShippingCsv } from '../src/services/shipping/shippingCsv.js';

const wilayas = [{
  code: '01', name: 'Example, Wilaya', homePrice: 0, stopDeskPrice: 400,
  homeEnabled: true, stopDeskEnabled: true,
  communes: [{ code: '001', name: 'Example commune', homePrice: null, stopDeskPrice: 200,
    homeEnabled: true, stopDeskEnabled: true,
    offices: [{ code: 'OFF1', name: 'Main "office"', address: 'Road 1', enabled: true },
      { code: 'OFF2', name: 'Second office', address: '', enabled: false }] }],
}];

test('CSV export and import preserve zero rates, overrides, offices and quoted text', () => {
  assert.deepEqual(importShippingCsv(exportShippingCsv(wilayas)), wilayas);
});
test('CSV import refuses conflicting or invalid rows before apply', () => {
  const csv = exportShippingCsv(wilayas);
  assert.throws(() => importShippingCsv(csv.replace('"400"', '"-1"')), /Invalid price/);
  assert.throws(() => importShippingCsv(csv.replace('"OFF2"', '"OFF1"')), /Duplicate office/);
});
