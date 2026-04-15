import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
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
import { ICategory } from "../types";

const CATEGORIES_KEY = ["categories"];

const getFileMeta = (uri: string) => {
  const segments = uri.split("/");
  const name = segments[segments.length - 1] || `category-${Date.now()}.jpg`;
  const ext = name.split(".").pop()?.toLowerCase();
  const type =
    ext === "png"
      ? "image/png"
      : ext === "gif"
        ? "image/gif"
        : "image/jpeg";

  return { uri, name, type };
};

export const useGetCategories = () => {
  const { token } = useAuthStore();

  return useQuery<ICategory[]>({
    queryKey: CATEGORIES_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ categories: ICategory[] }>(
        "/categories",
        token
          ? {
              headers: { Authorization: `Bearer ${token}` },
            }
          : undefined,
      );
      return data.categories;
    },
  });
};

export const useCreateCategory = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["category", "create"],
    mutationFn: async (payload: CreateCategoryPayload) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      
      if (payload.image_url) {
        formData.append("categoryImage", getFileMeta(payload.image_url) as any);
      }

      const { data } = await api.post<CreateCategoryResponse>(
        "/categories",
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      Alert.alert("Success", "Category created successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Failed to create category",
      );
    },
  });
};

export const useUpdateCategory = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["category", "update"],
    mutationFn: async (payload: UpdateCategoryPayload) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      
      if (payload.image_url) {
        formData.append("categoryImage", getFileMeta(payload.image_url) as any);
      }

      const { data } = await api.put<UpdateCategoryResponse>(
        `/categories/${payload.id}`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      Alert.alert("Success", "Category updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Failed to update category",
      );
    },
  });
};

export const useDeleteCategory = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["category", "delete"],
    mutationFn: async (payload: DeleteCategoryPayload) => {
      const { data } = await api.delete<DeleteCategoryResponse>(
        `/categories/${payload.id}`,
        {
          data: { password: payload.password },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      Alert.alert("Success", "Category deleted successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Failed to delete category",
      );
    },
  });
};
