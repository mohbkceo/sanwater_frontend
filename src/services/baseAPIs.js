import axios from "axios";

const productAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/products`,
    withCredentials: true
});
const contentAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/content`,
    withCredentials: true
});

export { productAPI, contentAPI} ;