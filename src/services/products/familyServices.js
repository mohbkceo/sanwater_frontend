import { familyAPI } from '../baseAPIs';

export async function getFamilies({ isAdmin = false } = {}) {
  const response = await familyAPI.get(isAdmin ? '/admin' : '/');
  return response.data;
}

export async function getFamily(slug) {
  const response = await familyAPI.get(`/${encodeURIComponent(slug)}`);
  return response.data;
}

export async function createFamily(data) {
  const response = await familyAPI.post('/', data);
  return response.data;
}

export async function updateFamily(id, data) {
  const response = await familyAPI.put(`/${id}`, data);
  return response.data;
}

export async function deleteFamily(id, password) {
  const response = await familyAPI.delete(`/${id}`, { data: { password } });
  return response.data;
}

export async function createSubFamily(familyId, data) {
  const response = await familyAPI.post(`/${familyId}/subfamilies`, data);
  return response.data;
}

export async function updateSubFamily(id, data) {
  const response = await familyAPI.put(`/subfamilies/${id}`, data);
  return response.data;
}

export async function deleteSubFamily(id, { password, replacementSubFamilyId } = {}) {
  const response = await familyAPI.delete(`/subfamilies/${id}`, {
    data: { password, ...(replacementSubFamilyId ? { replacementSubFamilyId } : {}) },
  });
  return response.data;
}

export async function assignProductsToSubFamily(id, productIds) {
  const response = await familyAPI.post(`/subfamilies/${id}/products`, { productIds });
  return response.data;
}

export async function removeProductsFromSubFamily(id, productIds) {
  const response = await familyAPI.delete(`/subfamilies/${id}/products`, { data: { productIds } });
  return response.data;
}
