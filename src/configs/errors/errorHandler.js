import { errorMessages } from "./errorsMessage";


export async function errorHandler(apiEndPointName, statusCode){
    let message =  errorMessages[apiEndPointName][statusCode]
    if(!message) message = `Somthing went wrong!`
    return message;
}