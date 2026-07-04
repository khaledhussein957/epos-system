import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { api } from "../lib/axios";
import { notify } from "../lib/notify";
import { useAuthStore } from "../store/auth.store";
import type { ICustomer } from "../types";
import type {
  CreateCustomerPayload,
  CustomerHistoryResponse,
  UpdateCustomerPayload,
} from "../types/customer.types";

const CUSTOMERS_KEY = ["customers"];

const errorMessage = (
  error: AxiosError<{ message?: string }>,
  fallback: string,
) => error.response?.data?.message ?? fallback;

export const useGetCustomers = (search?: string) => {
  const enabled = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    enabled,
    queryKey: [...CUSTOMERS_KEY, search ?? ""],
    queryFn: async () => {
      const { data } = await api.get<{ data: ICustomer[] }>("/customers", {
        params: search ? { search } : undefined,
      });
      return data.data;
    },
  });
};

export const useGetCustomer = (id: string | undefined) => {
  return useQuery({
    enabled: !!id,
    queryKey: [...CUSTOMERS_KEY, "one", id],
    queryFn: async () => {
      const { data } = await api.get<{ data: ICustomer }>(`/customers/${id}`);
      return data.data;
    },
  });
};

export const useGetCustomerHistory = (id: string | undefined) => {
  const enabled = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    enabled: enabled && !!id,
    queryKey: [...CUSTOMERS_KEY, "history", id],
    queryFn: async () => {
      const { data } = await api.get<CustomerHistoryResponse>(
        `/reports/customer-history/${id}`,
      );
      return data;
    },
  });
};

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...CUSTOMERS_KEY, "create"],
    mutationFn: async (payload: CreateCustomerPayload) => {
      const { data } = await api.post<{ data: ICustomer }>(
        "/customers",
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      notify.success("Customer created");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error(
        "Failed to create customer",
        errorMessage(error, "Try again."),
      );
    },
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...CUSTOMERS_KEY, "update"],
    mutationFn: async ({ id, ...patch }: UpdateCustomerPayload) => {
      const { data } = await api.put<{ data: ICustomer }>(
        `/customers/${id}`,
        patch,
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      notify.success("Customer updated");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error(
        "Failed to update customer",
        errorMessage(error, "Try again."),
      );
    },
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...CUSTOMERS_KEY, "delete"],
    mutationFn: async (id: string) => {
      await api.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      notify.success("Customer deleted");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error(
        "Failed to delete customer",
        errorMessage(error, "Try again."),
      );
    },
  });
};
