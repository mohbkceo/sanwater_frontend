export const HEADERS = [
  'wilayaCode', 'wilayaName', 'homePrice', 'stopDeskPrice', 'homeEnabled', 'stopDeskEnabled',
  'communeCode', 'communeName', 'communeHomePrice', 'communeStopDeskPrice',
  'communeHomeEnabled', 'communeStopDeskEnabled',
  'officeCode', 'officeName', 'officeAddress', 'officeEnabled',
];

function parseRows(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (char !== '\r') field += char;
  }
  if (quoted) throw new Error('CSV contains an unclosed quote.');
  if (row.length || field) { row.push(field); rows.push(row); }
  return rows.filter(item => item.some(cell => cell.trim()));
}
const price = (value, line) => {
  if (value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || !/^\d+(\.\d{1,2})?$/.test(value)) throw new Error(`Invalid price on CSV line ${line}.`);
  return number;
};
const bool = (value, line) => {
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  throw new Error(`Invalid availability on CSV line ${line}; use true or false.`);
};
const required = (value, label, line) => {
  if (!value) throw new Error(`Missing ${label} on CSV line ${line}.`);
  return value;
};

export function importShippingCsv(text) {
  const rows = parseRows(text.replace(/^\uFEFF/, ''));
  if (!rows.length || HEADERS.some((key, index) => rows[0][index]?.trim() !== key) || rows[0].length !== HEADERS.length) {
    throw new Error(`CSV headers must be: ${HEADERS.join(',')}`);
  }
  const wilayas = new Map();
  for (const [index, values] of rows.slice(1).entries()) {
    const line = index + 2;
    if (values.length !== HEADERS.length) throw new Error(`Wrong number of columns on CSV line ${line}.`);
    const r = Object.fromEntries(HEADERS.map((key, i) => [key, values[i].trim()]));
    const w = {
      code: required(r.wilayaCode, 'wilayaCode', line), name: required(r.wilayaName, 'wilayaName', line),
      homePrice: price(r.homePrice, line), stopDeskPrice: price(r.stopDeskPrice, line),
      homeEnabled: bool(r.homeEnabled, line), stopDeskEnabled: bool(r.stopDeskEnabled, line), communes: [],
    };
    const existing = wilayas.get(w.code);
    if (existing) {
      if (JSON.stringify({ ...existing, communes: [] }) !== JSON.stringify(w)) throw new Error(`Conflicting wilaya values on line ${line}.`);
    } else wilayas.set(w.code, w);
    if (!r.communeCode) {
      if (r.officeCode) throw new Error(`Office needs a commune on line ${line}.`);
      continue;
    }
    const parent = wilayas.get(w.code);
    const c = {
      code: r.communeCode, name: required(r.communeName, 'communeName', line),
      homePrice: price(r.communeHomePrice, line), stopDeskPrice: price(r.communeStopDeskPrice, line),
      homeEnabled: bool(r.communeHomeEnabled, line), stopDeskEnabled: bool(r.communeStopDeskEnabled, line), offices: [],
    };
    let commune = parent.communes.find(item => item.code === c.code);
    if (commune) {
      if (JSON.stringify({ ...commune, offices: [] }) !== JSON.stringify(c)) throw new Error(`Conflicting commune values on line ${line}.`);
    } else { parent.communes.push(c); commune = c; }
    if (r.officeCode) {
      if (commune.offices.some(item => item.code === r.officeCode)) throw new Error(`Duplicate office on line ${line}.`);
      commune.offices.push({ code: r.officeCode, name: required(r.officeName, 'officeName', line), address: r.officeAddress, enabled: bool(r.officeEnabled, line) });
    }
  }
  if (!wilayas.size) throw new Error('CSV contains no tariffs.');
  return [...wilayas.values()];
}

const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
export function exportShippingCsv(wilayas) {
  const rows = [HEADERS];
  for (const w of wilayas) {
    const communes = w.communes.length ? w.communes : [null];
    for (const c of communes) {
      const offices = c?.offices.length ? c.offices : [null];
      for (const o of offices) rows.push([
        w.code, w.name, w.homePrice, w.stopDeskPrice, w.homeEnabled, w.stopDeskEnabled,
        c?.code, c?.name, c?.homePrice, c?.stopDeskPrice, c?.homeEnabled, c?.stopDeskEnabled,
        o?.code, o?.name, o?.address, o?.enabled,
      ]);
    }
  }
  return rows.map(row => row.map(escape).join(',')).join('\r\n') + '\r\n';
}
