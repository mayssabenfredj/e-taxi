import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor to add token, skipping public routes
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      "[apiClient] Full Request URL:",
      `${API_BASE_URL}${config.url}`
    ); // Log full URL
    if (
      config.url?.includes("/login") ||
      config.url?.includes("/verify-enterprise-account") ||
      config.url?.includes("/forgot-password") ||
      config.url?.includes("/reset-password")
    ) {
      return config;
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);



export default apiClient;
