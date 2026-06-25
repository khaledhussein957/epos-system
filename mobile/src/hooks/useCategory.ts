import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { api } from "../lib/axios";
import { appendFile, getFileMeta } from "../lib/formData";
import { notify } from "../lib/notify";

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

const errorMessage = (error: AxiosError<{ message?: string }>, fallback: string) =>
  error.response?.data?.message ?? fallback;

export const useGetCategories = () => {
  return useQuery<ICategory[]>({
    queryKey: CATEGORIES_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ categories: ICategory[] }>("/categories");
      return data.categories;
    },
  });
};

type OptimisticCategory = ICategory & { optimistic?: boolean };

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateCategoryResponse,
    AxiosError<{ message?: string }>,
    CreateCategoryPayload,
    { previousCategories?: OptimisticCategory[] }
  >({
    mutationKey: ["category", "create"],

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_KEY });

      const previousCategories =
        queryClient.getQueryData<OptimisticCategory[]>(CATEGORIES_KEY);

      const optimisticCategory: OptimisticCategory = {
        id: `temp-${Date.now()}`,
        name: payload.name,
        image_url: payload.image_url.uri,
        optimistic: true,
      } as OptimisticCategory;

      queryClient.setQueryData<OptimisticCategory[]>(
        CATEGORIES_KEY,
        (old = []) => [optimisticCategory, ...old],
      );

      return { previousCategories };
    },

    mutationFn: async (payload) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      appendFile(formData, "categoryImage", payload.image_url);

      const { data } = await api.post<CreateCategoryResponse>(
        "/categories",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },

    onError: (error, _payload, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(CATEGORIES_KEY, context.previousCategories);
      }
      notify.error("Failed to create category", errorMessage(error, "Try again."));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["category", "update"],
    mutationFn: async (payload: UpdateCategoryPayload) => {
      const formData = new FormData();
      formData.append("name", payload.name);

      if (payload.image_url) {
        appendFile(formData, "categoryImage", getFileMeta(payload.image_url, "category"));
      }

      const { data } = await api.put<UpdateCategoryResponse>(
        `/categories/${payload.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      notify.success("Category updated");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to update category", errorMessage(error, "Try again."));
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["category", "delete"],
    mutationFn: async (payload: DeleteCategoryPayload) => {
      const { data } = await api.delete<DeleteCategoryResponse>(
        `/categories/${payload.id}`,
        { data: { password: payload.password } },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      notify.success("Category deleted");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to delete category", errorMessage(error, "Try again."));
    },
  });
};
