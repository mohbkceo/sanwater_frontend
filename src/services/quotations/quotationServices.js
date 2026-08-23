import { quotationAPI } from "../baseAPIs";

// Public — no auth required (product detail page, landing pages).
export const submitQuotation = async (data) => {
    const res = await quotationAPI.post("/", data);
    return res.data;
};

// Admin
export const getQuotations = async (params = {}) => {
    const res = await quotationAPI.get("/", { params });
    return res.data;
};

export const getQuotation = async (id) => {
    const res = await quotationAPI.get(`/${id}`);
    return res.data;
};

export const updateQuotationStatus = async (id, status, note) => {
    const res = await quotationAPI.put(`/${id}/status`, { status, note });
    return res.data;
};

export const assignQuotation = async (id, assignedAdmin) => {
    const res = await quotationAPI.put(`/${id}/assign`, { assignedAdmin });
    return res.data;
};
