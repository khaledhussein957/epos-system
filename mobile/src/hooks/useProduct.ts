import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
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

const PRODUCTS_KEY = ["products"];

const getFileMeta = (uri: string) => {
  const segments = uri.split("/");
  const name = segments[segments.length - 1] || `product-${Date.now()}.jpg`;
  const ext = name.split(".").pop()?.toLowerCase();
  const type =
    ext === "png"
      ? "image/png"
      : ext === "gif"
        ? "image/gif"
        : "image/jpeg";

  return { uri, name, type };
};

export const useGetProducts = () => {
  return useQuery<IProduct[]>({
    queryKey: PRODUCTS_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ products: IProduct[] }>("/products");
      return data.products;
    },
  });
};

export const useGetProduct = (id: string) => {
  return useQuery<IProduct>({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<{ product: IProduct }>(`/products/${id}`);
      return data.product;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["product", "create"],
    mutationFn: async (payload: CreateProductPayload) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("description", payload.description);
      formData.append("category_id", payload.category_id);
      formData.append("price", String(payload.price));
      formData.append("stock", String(payload.stock));
      formData.append("is_active", String(payload.is_active));
      formData.append("productImage", getFileMeta(payload.imageUri) as any);

      const { data } = await api.post<CreateProductResponse>(
        "/products",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      Alert.alert("Success", "Product created successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Failed to create product",
      );
    },
  });
};

export const useUploadProductImage = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["product", "upload-image"],
    mutationFn: async (payload: UploadProductImagePayload) => {
      const formData = new FormData();
      formData.append("productImage", getFileMeta(payload.imageUri) as any);

      const { data } = await api.put<UploadProductImageResponse>(
        `/products/product-image/${payload.productId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Failed to upload product image",
      );
    },
  });
};

export const useUpdateProduct = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const uploadImage = useUploadProductImage();

  return useMutation({
    mutationKey: ["product", "update"],
    mutationFn: async (payload: UpdateProductPayload) => {
      const { data } = await api.put<UpdateProductResponse>(
        `/products/${payload.id}`,
        {
          name: payload.name,
          description: payload.description,
          category_id: payload.category_id,
          price: payload.price,
          stock: payload.stock,
          is_active: payload.is_active,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (payload.imageUri) {
        await uploadImage.mutateAsync({
          productId: payload.id,
          imageUri: payload.imageUri,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      Alert.alert("Success", "Product updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Failed to update product",
      );
    },
  });
};

export const useDeleteProduct = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["product", "delete"],
    mutationFn: async (payload: DeleteProductPayload) => {
      const { data } = await api.delete<DeleteProductResponse>(
        `/products/${payload.id}`,
        {
          data: { password: payload.password },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      Alert.alert("Success", "Product deleted successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Failed to delete product",
      );
    },
  });
};
