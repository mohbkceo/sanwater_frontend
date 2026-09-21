import { userAPI } from "../baseAPIs"
import { clearCsrfToken } from "../csrfToken"


export const signIn_API = async (data) => {
    const res = await  userAPI.post('/auth/signin', data)
    return res.data;
}
export const register_API = async (data) => {
    const res = await  userAPI.post('/auth/register', data)
    return res.data;
}

export const logout_API = async () => {
    const res = await userAPI.post('/auth/logout')
    clearCsrfToken();
    return res.data;
}
