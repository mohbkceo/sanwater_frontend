import { shippingAPI } from '../baseAPIs';

export const getWilayas = async () => (await shippingAPI.get('/wilayas')).data.data;
export const getCommunes = async (wilayaCode) => (await shippingAPI.get(`/wilayas/${encodeURIComponent(wilayaCode)}/communes`)).data.data;
export const getOffices = async (wilayaCode, communeCode) => (await shippingAPI.get(`/wilayas/${encodeURIComponent(wilayaCode)}/communes/${encodeURIComponent(communeCode)}/offices`)).data.data;
export const getShippingQuote = async (params) => (await shippingAPI.get('/quote', { params })).data.data;
export const getAdminShipping = async () => (await shippingAPI.get('/admin')).data.data;
export const saveWilaya = async (revision, wilaya) => (await shippingAPI.put(`/admin/wilayas/${encodeURIComponent(wilaya.code)}`, { revision, wilaya })).data.data;
export const saveBulkShipping = async (revision, wilayas, dryRun = false) => (await shippingAPI.put('/admin/bulk', { revision, wilayas, dryRun })).data.data;
