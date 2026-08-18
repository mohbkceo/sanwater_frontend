import { categoryAPI } from "../baseAPIs";

export const getCategories = async (params = {}) => {
    const res = await categoryAPI.get("/", { params });
    return res.data;
};

export const getCategory = async (slug) => {
    const res = await categoryAPI.get(`/${slug}`);
    return res.data;
};

export const createCategory = async (data) => {
    const res = await categoryAPI.post("/", data);
    return res.data;
};

export const updateCategory = async (slug, data) => {
    const res = await categoryAPI.put(`/${slug}`, data);
    return res.data;
};

export const deleteCategory = async (slug) => {
    const res = await categoryAPI.delete(`/${slug}`);
    return res.data;
};
