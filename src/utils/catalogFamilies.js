export function normalizeFamilyKey(value) {
  return String(value ?? '').trim();
}

export function deriveSubFamily(productId) {
  return String(productId ?? '').trim().slice(0, 2).toUpperCase();
}
