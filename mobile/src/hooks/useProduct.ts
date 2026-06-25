import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { api } from "../lib/axios";
import { appendFile, getFileMeta } from "../lib/formData";
import { notify } from "../lib/notify";

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

const errorMessage = (error: AxiosError<{ message?: string }>, fallback: string) =>
  error.response?.data?.message ?? fallback;

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
      appendFile(formData, "productImage", getFileMeta(payload.imageUri, "product"));

      const { data } = await api.post<CreateProductResponse>(
        "/products",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      notify.success("Product created");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to create product", errorMessage(error, "Try again."));
    },
  });
};

export const useUploadProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["product", "upload-image"],
    mutationFn: async (payload: UploadProductImagePayload) => {
      const formData = new FormData();
      appendFile(formData, "productImage", getFileMeta(payload.imageUri, "product"));

      const { data } = await api.put<UploadProductImageResponse>(
        `/products/product-image/${payload.productId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to upload image", errorMessage(error, "Try again."));
    },
  });
};

export const useUpdateProduct = () => {
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
      notify.success("Product updated");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to update product", errorMessage(error, "Try again."));
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["product", "delete"],
    mutationFn: async (payload: DeleteProductPayload) => {
      const { data } = await api.delete<DeleteProductResponse>(
        `/products/${payload.id}`,
        { data: { password: payload.password } },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      notify.success("Product deleted");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to delete product", errorMessage(error, "Try again."));
    },
  });
};
