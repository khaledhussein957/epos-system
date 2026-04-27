import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { api } from "../lib/axios";
import { useAuthStore } from "../store/auth.store";

type DashboardResponse = {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalCategories: number;
  totalRevenue: number;
};

type ApiResponse<T> = {
  message: string;
  data: T;
};

export const useGetDashboard = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["dashboard"],
    enabled: !!token,
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardResponse>>("/dashboard");

      return res.data.data; // 👈 THIS FIXES EVERYTHING
    },
    staleTime: 1000 * 30,
  });
};
