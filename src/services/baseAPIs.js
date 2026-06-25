import { errorAxiosInterceptor, unauthorizeErrorHandle } from "@/configs/errors/errorAxiosInteraptor";
import { SANWATERGROUPROUTES } from "@/configs/routes/routesConfig";
import axios from "axios";


const productAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/products`,
    withCredentials: true
});
const contentAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/content`,
    withCredentials: true
});
const userAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/user`,
    withCredentials: true
})

const analyticsAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/analytics`,
    withCredentials: true
})

const newsAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/news`,
    withCredentials: true
})

export { productAPI, userAPI, contentAPI, analyticsAPI, newsAPI} ;

[productAPI, userAPI, contentAPI, analyticsAPI, newsAPI].forEach(api => api.interceptors.response.use(res => res, 
    async (error) => {   
        await unauthorizeErrorHandle(api, error, SANWATERGROUPROUTES.auth.login.fullPath)
        const apiPath = error.config?.baseURL?.substring(import.meta.env.VITE_BACK_END_BASE_URL.length)
        return errorAxiosInterceptor(error, apiPath);
    }
))
