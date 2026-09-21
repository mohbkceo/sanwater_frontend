import { errorAxiosInterceptor, unauthorizeErrorHandle } from "@/configs/errors/errorAxiosInteraptor";
import { SANWATERGROUPROUTES } from "@/configs/routes/routesConfig";
import { clearCsrfToken, ensureCsrfToken, isCsrfError, setCsrfToken } from "./csrfToken";
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

const familyAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_BASE_URL}/families`,
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

export { productAPI, userAPI, contentAPI, analyticsAPI, newsAPI, familyAPI, quotationAPI, leadAPI } ;

const allAPIs = [productAPI, userAPI, contentAPI, analyticsAPI, newsAPI, familyAPI, quotationAPI, leadAPI];

// In production the frontend and API use different hosts, so the API's
// host-only CSRF cookie is intentionally invisible to document.cookie on the
// frontend. Fetch the matching nonce from the API and echo it in the header.
allAPIs.forEach(api => api.interceptors.request.use(async config => {
    if (config.method && !['get', 'head', 'options'].includes(config.method)) {
        const csrfToken = await ensureCsrfToken();
        config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
}))

allAPIs.forEach(api => api.interceptors.response.use(res => {
    setCsrfToken(res.data?.csrfToken);
    return res;
},
    async (error) => {
        if (isCsrfError(error) && error.config && !error.config._csrfRetry) {
            error.config._csrfRetry = true;
            clearCsrfToken();
            try {
                await ensureCsrfToken();
                return api(error.config);
            } catch {
                // Fall through to the normal API error handling below.
            }
        }

        const retriedResponse = await unauthorizeErrorHandle(api, error, SANWATERGROUPROUTES.auth.login.fullPath)
        if (retriedResponse) return retriedResponse;
        const apiPath = error.config?.baseURL?.substring(import.meta.env.VITE_BACK_END_BASE_URL.length)
        return errorAxiosInterceptor(error, apiPath);
    }
))
