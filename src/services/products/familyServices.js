import { familyAPI } from '../baseAPIs';

export async function getFamilies({ isAdmin = false } = {}) {
  const response = await familyAPI.get(isAdmin ? '/admin' : '/');
  return response.data;
}

export async function getFamily(familyKey) {
  const response = await familyAPI.get(`/${encodeURIComponent(familyKey)}`);
  return response.data;
}

export async function updateFamilyConfig(familyKey, data) {
  const response = await familyAPI.put(
    `/${encodeURIComponent(familyKey)}/config`,
    data,
  );
  return response.data;
}

export async function updateSubFamilyConfig(familyKey, subFamilyKey, data) {
  const response = await familyAPI.put(
    `/${encodeURIComponent(familyKey)}/subfamilies/${encodeURIComponent(subFamilyKey)}/config`,
    data,
  );
  return response.data;
}
