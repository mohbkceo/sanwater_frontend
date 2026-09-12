import { newsAPI } from "./baseAPIs";

export const getNewsArticles = async (params = {}) => (await newsAPI.get('/', { params })).data;

export const getNewsArticleBySlug = async (slug) => (await newsAPI.get(`/article/${slug}`)).data;

export const getAdminNewsArticleById = async (id) => (await newsAPI.get(`/admin/${id}`)).data;
export const autosaveNewsArticle = async (id, data) => (await newsAPI.patch(`/${id}/autosave`, data)).data;
export const getNewsRevisions = async (id) => (await newsAPI.get(`/admin/${id}/revisions`)).data;
export const getNewsRevision = async (id, revisionId) => (await newsAPI.get(`/admin/${id}/revisions/${revisionId}`)).data;
export const restoreNewsRevision = async (id, revisionId) => (await newsAPI.post(`/${id}/revisions/${revisionId}/restore`)).data;
export const bulkUpdateNews = async (ids, action) => (await newsAPI.post('/bulk', { ids, action })).data;

export const createNewsArticle = async (data) => (await newsAPI.post('/', data)).data;

export const updateNewsArticle = async (id, data) => (await newsAPI.put(`/${id}`, data)).data;

export const deleteNewsArticle = async (id) => (await newsAPI.delete(`/${id}`)).data;

export const getAdminNewsArticles = async (params = {}) => (await newsAPI.get('/admin/all', { params })).data;
