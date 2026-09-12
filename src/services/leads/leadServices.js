import { leadAPI } from "../baseAPIs";

export const submitLead = async (data) => (await leadAPI.post("/", data)).data;
export const getLeads = async (params = {}) => (await leadAPI.get("/", { params })).data;
export const getLeadOptions = async () => (await leadAPI.get("/options")).data;
export const getLead = async (id) => (await leadAPI.get(`/${id}`)).data;
export const updateLead = async (id, data) => (await leadAPI.patch(`/${id}`, data)).data;
export const addLeadNote = async (id, content) => (await leadAPI.post(`/${id}/notes`, { content })).data;
export const assignLead = async (id, assignedTo) => (await leadAPI.put(`/${id}/assign`, { assignedTo })).data;
export const updateLeadStatus = async (id, data) => (await leadAPI.put(`/${id}/status`, data)).data;
