import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
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

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const REFRESH_PATH = "/auth/refresh";

let refreshInFlight: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  if (!refreshToken) {
    logout();
    return null;
  }

  try {
    const { data } = await axios.post<{ token: string; refreshToken: string }>(
      `${baseUrl}${REFRESH_PATH}`,
      { refreshToken },
      { withCredentials: true },
    );
    setTokens(data.token, data.refreshToken);
    return data.token;
  } catch {
    logout();
    return null;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const original = error.config as RetryableConfig | undefined;

    if (!error.response) {
      notify.error("Network error", "Check your internet connection.");
      return Promise.reject(error);
    }

    if (!original || original.url?.endsWith(REFRESH_PATH)) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !original._retry) {
      original._retry = true;

      refreshInFlight = refreshInFlight ?? refreshAccessToken();
      const newToken = await refreshInFlight;
      refreshInFlight = null;

      if (!newToken) {
        if (useAuthStore.getState().isAuthenticated) {
          notify.error("Session expired", "Please sign in again.");
        }
        useAuthStore.getState().logout();
        router.replace("/(auth)");
        return Promise.reject(error);
      }

      original.headers.Authorization = `Bearer ${newToken}`;
      return api.request(original as AxiosRequestConfig);
    }

    return Promise.reject(error);
  },
);
