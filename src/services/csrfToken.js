import axios from "axios";

let csrfToken = null;
let csrfRequest = null;

export function setCsrfToken(token) {
  if (typeof token === "string" && token.length > 0) {
    csrfToken = token;
  }
}

export function clearCsrfToken() {
  csrfToken = null;
}

export async function ensureCsrfToken() {
  if (csrfToken) return csrfToken;

  if (!csrfRequest) {
    csrfRequest = axios
      .get(`${import.meta.env.VITE_BACK_END_BASE_URL}/user/auth/csrf`, {
        withCredentials: true,
      })
      .then((response) => {
        const token = response.data?.csrfToken;
        if (!token) throw new Error("The API did not return a CSRF token");
        setCsrfToken(token);
        return token;
      })
      .finally(() => {
        csrfRequest = null;
      });
  }

  return csrfRequest;
}

export function isCsrfError(error) {
  return (
    error.response?.status === 403 &&
    error.response?.data?.message === "Invalid or missing CSRF token"
  );
}
