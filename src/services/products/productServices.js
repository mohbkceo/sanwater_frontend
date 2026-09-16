import { productAPI } from "../baseAPIs";

export const createProduct = async (data) => {
    const res = await productAPI.post("/", data);
    return res.data;
};

export const getProducts = async (params = {}) => {
  const { isAdmin, ...query } = params;
  const res = await productAPI.get(isAdmin ? "/admin" : "/", { params: query });
  return res.data;
};

export const getProduct = async (serialNumber) => {
    const res = await productAPI.get(`/${serialNumber}`);
    return res.data;
};

export const updateProduct = async (serialNumber, data) => {
    const res = await productAPI.put(`/${serialNumber}`, data);
    return res.data;
};

export const deleteProduct = async (serialNumber) => {
    const res = await productAPI.delete(`/${serialNumber}`);
    return res.data;
};

