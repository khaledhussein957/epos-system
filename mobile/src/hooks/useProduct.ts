import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

import { api } from "../lib/axios";
import { useAuthStore } from "../store/auth.store";

import {
  CreateProductPayload,
  CreateProductResponse,
  DeleteProductPayload,
  DeleteProductResponse,
  UpdateProductPayload,
  UpdateProductResponse,
  UploadProductImagePayload,
  UploadProductImageResponse,
} from "../types/product.types";
import { IProduct } from "../types";

export const useGetProducts = () => {
  const { token } = useAuthStore();
  return useMutation({
    mutationKey: ["product", "get"],
    mutationFn: async () => {
      const { data } = await api.get<IProduct[]>("/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useGetProduct = (id: string) => {
  const { token } = useAuthStore();
  return useMutation({
    mutationKey: ["product", "get", id],
    mutationFn: async () => {
      const { data } = await api.get<IProduct>(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useCreateProduct = () => {
  const router = useRouter();

  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["product", "create"],
    mutationFn: async (payload: CreateProductPayload) => {
      const { data } = await api.post<CreateProductResponse>(
        "/products",
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
      Alert.alert("Success", "Product created successfully");
      router.push("/products");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useUpdateProduct = () => {
  const router = useRouter();

  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["product", "update"],
    mutationFn: async (payload: UpdateProductPayload) => {
      const { data } = await api.put<UpdateProductResponse>(
        `/products/${payload.id}`,
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
      Alert.alert("Success", "Product updated successfully");
      router.push("/products");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useUploadProductImage = () => {
  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["product", "upload"],
    mutationFn: async (payload: UploadProductImagePayload) => {
      const { data } = await api.post<UploadProductImageResponse>(
        "/products/upload",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useDeleteProduct = () => {
  const router = useRouter();

  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["product", "delete"],
    mutationFn: async (payload: DeleteProductPayload) => {
      const { data } = await api.delete<DeleteProductResponse>(
        `/products/${payload.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Product deleted successfully");
      router.push("/products");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};
