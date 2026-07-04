import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";

import { api } from "../lib/axios";
import { notify } from "../lib/notify";
import { useAuthStore } from "../store/auth.store";
import {
  RegisterPayload,
  RegisterResponse,
  LoginPayload,
  LoginResponse,
  recoveryPasswordPayload,
  recoveryPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from "../types/auth.types";

const errorMessage = (
  error: AxiosError<{ message?: string }>,
  fallback: string,
) => error.response?.data?.message ?? fallback;

const landingRoute = (role: string | undefined): "/(admin-tabs)" | "/(user-tabs)" => {
  if (role === "admin" || role === "cashier") return "/(admin-tabs)";
  return "/(user-tabs)";
};

export const useRegister = () => {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await api.post<RegisterResponse>(
        "/auth/register",
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.refreshToken);
      router.replace(landingRoute(data.user.role));
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Registration failed", errorMessage(error, "Try again."));
    },
  });
};

export const useLogin = () => {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<LoginResponse>("/auth/login", payload);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.refreshToken);
      router.replace(landingRoute(data.user.role));
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Sign in failed", errorMessage(error, "Check your credentials."));
    },
  });
};

export const useRecoveryPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationKey: ["auth", "recoveryPassword"],
    mutationFn: async (payload: recoveryPasswordPayload) => {
      const { data } = await api.post<recoveryPasswordResponse>(
        "/auth/request-password-reset",
        payload,
      );
      return data;
    },
    onSuccess: (_, variables) => {
      notify.success("Reset code sent", "Check your email.");
      router.push({
        pathname: "/(auth)/verify_code",
        params: { email: variables.email },
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to send code", errorMessage(error, "Try again."));
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: async () => {
      const { refreshToken } = useAuthStore.getState();
      try {
        if (refreshToken) {
          await api.post("/auth/logout", { refreshToken });
        }
      } catch {
        // Server revocation failed; we still log out locally.
      }
    },
    onSettled: () => {
      useAuthStore.getState().logout();
      queryClient.clear();
      router.replace("/(auth)");
    },
  });
};

export const useResetPassword = () => {
  const router = useRouter();
  return useMutation({
    mutationKey: ["auth", "resetPassword"],
    mutationFn: async (payload: ResetPasswordPayload) => {
      const { data } = await api.post<ResetPasswordResponse>(
        "/auth/reset-password",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      notify.success("Password reset successful");
      router.replace("/(auth)");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Reset failed", errorMessage(error, "Try again."));
    },
  });
};
