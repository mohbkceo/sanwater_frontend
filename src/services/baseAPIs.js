import { errorAxiosInterceptor } from "@/configs/errors/errorAxiosInteraptor";
import axios from "axios";


const productAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/products`,
    withCredentials: true
});
const contentAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/content`,
    withCredentials: true
});


[productAPI, contentAPI].forEach(api => api.interceptors.response.use(res => res, 
    (error) => {
        const apiPath = error.config?.baseURL?.substring(import.meta.env.VITE_BACK_END_BASE_URL.length)
        return errorAxiosInterceptor(error, apiPath);
    }
))

export { productAPI, contentAPI} ;