import { userAPI } from "../baseAPIs"


export const signIn_API = async (data) => {
    const res = await  userAPI.post('/auth/signin', data)
    return res.data;
}
export const register_API = async (data) => {
    const res = await  userAPI.post('/auth/register', data)
    return res.data;
}