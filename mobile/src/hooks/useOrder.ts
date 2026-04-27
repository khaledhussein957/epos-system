import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

import { api } from "../lib/axios";
import { useAuthStore } from "../store/auth.store";
import { CreateOrderPayload, CreateOrderResponse } from "../types/order.types";
import { IOrder } from "@/types";

export const useGetOrders = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["orders"],
    enabled: !!token,
    queryFn: async () => {
      const { data } = await api.get<IOrder[]>("/orders");
      return data;
    },
  });
};

export const useCreateOrder = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["orders", "create"],
    mutationFn: async (payload: CreateOrderPayload) => {
      const { data } = await api.post<CreateOrderResponse>("/orders", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] });

      Alert.alert("Success", "Order created successfully");
      router.push("/orders");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong",
      );
    },
  });
};

export const useGetMyOrders = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["orders", "me"],
    enabled: !!token,
    queryFn: async () => {
      const { data } = await api.get<IOrder[]>("/orders/my-orders");
      return data;
    },
  });
};
