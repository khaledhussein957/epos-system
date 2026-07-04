import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/axios";
import { useAuthStore } from "../store/auth.store";

export interface DailySale {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  imageUrl: string | null;
  quantitySold: number;
  revenue: number;
}

export interface LowStockItem {
  id: string;
  name: string;
  imageUrl: string | null;
  stock: number;
  price: number;
}

export interface RevenueByCashier {
  userId: string;
  name: string;
  email: string;
  role: string;
  orderCount: number;
  revenue: number;
}

type DateRange = { from?: string; to?: string };

const useAdmin = () => {
  const { isAuthenticated, user } = useAuthStore();
  return isAuthenticated && user?.role === "admin";
};

export const useDailySales = (range?: DateRange) => {
  const enabled = useAdmin();
  return useQuery({
    enabled,
    queryKey: ["reports", "daily-sales", range?.from, range?.to],
    queryFn: async () => {
      const { data } = await api.get<{ data: DailySale[] }>(
        "/reports/daily-sales",
        { params: range },
      );
      return data.data;
    },
  });
};

export const useTopProducts = (params?: DateRange & { limit?: number }) => {
  const enabled = useAdmin();
  return useQuery({
    enabled,
    queryKey: ["reports", "top-products", params?.from, params?.to, params?.limit],
    queryFn: async () => {
      const { data } = await api.get<{ data: TopProduct[] }>(
        "/reports/top-products",
        { params },
      );
      return data.data;
    },
  });
};

export const useLowStock = (threshold = 5) => {
  const enabled = useAdmin();
  return useQuery({
    enabled,
    queryKey: ["reports", "low-stock", threshold],
    queryFn: async () => {
      const { data } = await api.get<{ data: LowStockItem[]; threshold: number }>(
        "/reports/low-stock",
        { params: { threshold } },
      );
      return data.data;
    },
  });
};

export const useRevenueByCashier = (range?: DateRange) => {
  const enabled = useAdmin();
  return useQuery({
    enabled,
    queryKey: ["reports", "revenue-by-cashier", range?.from, range?.to],
    queryFn: async () => {
      const { data } = await api.get<{ data: RevenueByCashier[] }>(
        "/reports/revenue-by-cashier",
        { params: range },
      );
      return data.data;
    },
  });
};
