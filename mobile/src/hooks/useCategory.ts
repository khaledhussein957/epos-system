import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

import { api } from "../lib/axios";
import { useAuthStore } from "../store/auth.store";

import {
  CreateCategoryPayload,
  CreateCategoryResponse,
  DeleteCategoryPayload,
  DeleteCategoryResponse,
  UpdateCategoryPayload,
  UpdateCategoryResponse,
} from "../types/category.types";

export const useGetCategories = () => {
  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["category", "get"],
    mutationFn: async () => {
      const { data } = await api.get("/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
  });
};

export const useCreateCategory = () => {
  const router = useRouter();

  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["category", "create"],
    mutationFn: async (payload: CreateCategoryPayload) => {
      const { data } = await api.post<CreateCategoryResponse>(
        "/categories",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Category created successfully");
      router.push("/categories");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useUpdateCategory = () => {
  const router = useRouter();

  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["category", "update"],
    mutationFn: async (payload: UpdateCategoryPayload) => {
      const { data } = await api.put<UpdateCategoryResponse>(
        `/categories/${payload.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Category updated successfully");
      router.push("/categories");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useDeleteCategory = () => {
  const router = useRouter();

  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["category", "delete"],
    mutationFn: async (payload: DeleteCategoryPayload) => {
      const { data } = await api.delete<DeleteCategoryResponse>(
        `/categories/${payload.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Category deleted successfully");
      router.push("/categories");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};
