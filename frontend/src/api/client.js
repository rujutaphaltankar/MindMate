import axios from "axios";

// In dev, Vite proxies /api -> http://localhost:5000 (see vite.config.js),
// so no base URL/env var is needed locally. In production, set VITE_API_URL.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("mindmate_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If an access token expires, try one silent refresh before giving up.
let isRefreshing = false;
let queuedRequests = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || originalRequest._retry || originalRequest.url?.includes("/auth/")) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("mindmate_refresh_token");
    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queuedRequests.push({ resolve, reject, originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${apiClient.defaults.baseURL}/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );
      localStorage.setItem("mindmate_access_token", data.access_token);
      queuedRequests.forEach(({ resolve, originalRequest: req }) => {
        req.headers.Authorization = `Bearer ${data.access_token}`;
        resolve(apiClient(req));
      });
      queuedRequests = [];
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("mindmate_access_token");
      localStorage.removeItem("mindmate_refresh_token");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
