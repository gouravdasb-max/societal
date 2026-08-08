import axios from "axios";

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.includes("localhost")) {
    return "/api/v1";
  }
  return envUrl || "/api/v1";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

let refreshPromise = null;

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh-token", {}, { _skipAuthRefresh: true })
      .then((response) => {
        const accessToken = response?.data?.data?.accessToken;
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthMeRequest = originalRequest?.url?.includes("/auth/me");
    const isPublicAuthRequest = originalRequest?.url?.startsWith("/auth/") && !isAuthMeRequest;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest._skipAuthRefresh &&
      !isPublicAuthRequest &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        await refreshAccessToken();
        return api(originalRequest);
      } catch (_refreshError) {
        localStorage.removeItem("accessToken");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
