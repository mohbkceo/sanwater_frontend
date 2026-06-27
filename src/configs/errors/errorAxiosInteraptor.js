import { toast } from "sonner";
import { errorHandler } from "./errorHandler";
import axios from "axios";

export async function errorAxiosInterceptor(error, apiEndPointName){
    let message;
    let statusCode;

    if(!error.response) {
      message = errorHandler('/api/users', 500);
    } else {
        statusCode = error.response?.status;
        message = errorHandler(apiEndPointName, statusCode);
    }
   
    toast.error(message);
    const normalizedError = {
        status: statusCode,
        message: message,
        type: `API_ERR`
    }
    return Promise.reject(normalizedError);
}

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, _ = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(_);
    }
  });
  failedQueue = [];
};

export async function unauthorizeErrorHandle(axiosInstance, err, loginRoute) {
     const originalRequest = err.config;
      if (err.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

         if (isRefreshing) {
           
          return new Promise(function (resolve, reject) {
                failedQueue.push({ resolve, reject });
          })
                .then(_ => {
                return axiosInstance(originalRequest);
                })
                .catch(err => {
                return Promise.reject(err);
                });
          }

          isRefreshing = true;

        try {
          const response = await axios.get(`${import.meta.env.VITE_BACK_END_BASE_URL}/user/auth/getaccesstoken/v1`, {
          withCredentials: true
          });
          console.log(response)
          processQueue(null, response.statusText);
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          //window.location.href = loginRoute
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
}