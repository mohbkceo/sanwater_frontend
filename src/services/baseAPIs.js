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

const categoryAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/categories`,
    withCredentials: true
})

const collectionAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/collections`,
    withCredentials: true
})

const quotationAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/quotations`,
    withCredentials: true
})

const leadAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/leads`,
    withCredentials: true
})

export { productAPI, userAPI, contentAPI, analyticsAPI, newsAPI, categoryAPI, collectionAPI, quotationAPI, leadAPI } ;

const allAPIs = [productAPI, userAPI, contentAPI, analyticsAPI, newsAPI, categoryAPI, collectionAPI, quotationAPI, leadAPI];

// Read the CSRF double-submit cookie (server: middlewares/authentication/csrf.js)
// and echo it back as a header on state-changing requests — the server
// rejects POST/PUT/PATCH/DELETE under an admin session without a match.
// Safe to attach on every instance: it's a no-op for public/unauthenticated
// calls (no cookie, header omitted) and for GET requests (not checked).
function readCookie(name) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

allAPIs.forEach(api => api.interceptors.request.use(config => {
    if (config.method && !['get', 'head', 'options'].includes(config.method)) {
        const csrfToken = readCookie('csrf_token');
        if (csrfToken) config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
}))

allAPIs.forEach(api => api.interceptors.response.use(res => res,
    async (error) => {
        await unauthorizeErrorHandle(api, error, SANWATERGROUPROUTES.auth.login.fullPath)
        const apiPath = error.config?.baseURL?.substring(import.meta.env.VITE_BACK_END_BASE_URL.length)
        return errorAxiosInterceptor(error, apiPath);
    }
))
