import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

// Use Expo's public environment configuration or fallback safely
// const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3000";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  async (config) => {
    // Dynamically pull the latest token from the Zustand store
    const token = useAuthStore.getState().token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If backend returns 401 Unauthorized, wipe local tokens and push to login screen
    if (error.response && error.response.status === 401) {
      await useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
