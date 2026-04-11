import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

import { api } from "../lib/axios";
import { useAuthStore } from "../store/auth.store";
import { CreateOrderPayload, CreateOrderResponse } from "../types/order.types";

export const useCreateOrder = () => {
  const router = useRouter();
  const { token } = useAuthStore();
  return useMutation({
    mutationKey: ["order", "create"],
    mutationFn: async (payload: CreateOrderPayload) => {
      const { data } = await api.post<CreateOrderResponse>("/orders", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Order created successfully");
      router.push("/orders");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};
