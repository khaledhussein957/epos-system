import axios, { AxiosError } from "axios";
import { router } from "expo-router";

import { useAuthStore } from "@/store/auth.store";
import { notify } from "@/lib/notify";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      const { isAuthenticated, logout } = useAuthStore.getState();
      if (isAuthenticated) {
        logout();
        notify.error("Session expired", "Please sign in again.");
        router.replace("/(auth)");
      }
    }

    if (!error.response) {
      notify.error("Network error", "Check your internet connection.");
    }

    return Promise.reject(error);
  },
);
