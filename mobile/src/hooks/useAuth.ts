import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

import { api } from "../lib/axios";
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
      setAuth(data.user, data.token);
      if (data.user.role === "admin") {
        router.push("/(admin-tabs)");
      } else {
        router.push("/(user-tabs)");
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
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
      setAuth(data.user, data.token);
      if (data.user.role === "admin") {
        router.push("/(admin-tabs)");
      } else {
        router.push("/(user-tabs)");
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
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
      Alert.alert(
        "Success",
        "A password reset code has been sent to your email",
      );

      router.push({
        pathname: "/(auth)/verify_code",
        params: { email: variables.email },
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
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
      Alert.alert("Success", "Your password has been reset");
      router.push("/(auth)");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};
