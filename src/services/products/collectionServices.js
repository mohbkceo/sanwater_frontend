import { collectionAPI } from "../baseAPIs";

export const getCollections = async (params = {}) => {
    const res = await collectionAPI.get("/", { params });
    return res.data;
};

export const getCollection = async (slug) => {
    const res = await collectionAPI.get(`/${slug}`);
    return res.data;
};

export const createCollection = async (data) => {
    const res = await collectionAPI.post("/", data);
    return res.data;
};

export const updateCollection = async (slug, data) => {
    const res = await collectionAPI.put(`/${slug}`, data);
    return res.data;
};

export const deleteCollection = async (slug) => {
    const res = await collectionAPI.delete(`/${slug}`);
    return res.data;
};
