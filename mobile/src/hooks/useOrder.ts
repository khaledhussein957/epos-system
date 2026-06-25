import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";

import { api } from "../lib/axios";
import { useAuthStore } from "../store/auth.store";
import { notify } from "../lib/notify";
import { CreateOrderPayload, CreateOrderResponse } from "../types/order.types";
import { IOrder } from "@/types";

export const useGetOrders = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ["orders"],
    enabled: isAuthenticated,
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

      notify.success("Order created");
      router.push("/orders");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error(
        "Failed to create order",
        error.response?.data?.message ?? "Try again.",
      );
    },
  });
};

export const useGetMyOrders = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ["orders", "me"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await api.get<IOrder[]>("/orders/my-orders");
      return data;
    },
  });
};
