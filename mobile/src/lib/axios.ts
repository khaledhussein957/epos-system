import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "@/store/auth.store";

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
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;

    if (!original || original.url?.endsWith(REFRESH_PATH)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      refreshInFlight = refreshInFlight ?? refreshAccessToken();
      const newToken = await refreshInFlight;
      refreshInFlight = null;

      if (!newToken) {
        return Promise.reject(error);
      }

      original.headers.Authorization = `Bearer ${newToken}`;
      return api.request(original as AxiosRequestConfig);
    }

    return Promise.reject(error);
  },
);
