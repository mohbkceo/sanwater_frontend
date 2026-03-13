import { toast } from "sonner";
import { errorHandler } from "./errorHandler";

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