import { newsAPI } from "./baseAPIs";

export const getNewsArticles = async (params = {}) => {
    try {
        const response = await newsAPI.get('/', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getNewsArticleBySlug = async (slug) => {
    try {
        const response = await newsAPI.get(`/article/${slug}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createNewsArticle = async (data) => {
    try {
        const response = await newsAPI.post('/', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateNewsArticle = async (id, data) => {
    try {
        const response = await newsAPI.put(`/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteNewsArticle = async (id) => {
    try {
        const response = await newsAPI.delete(`/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAdminNewsArticles = async (params = {}) => {
    try {
        const response = await newsAPI.get('/admin/all', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};
