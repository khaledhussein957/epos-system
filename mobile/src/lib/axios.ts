import { useAuthStore } from "@/store/auth.store";
import axios from "axios";

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
