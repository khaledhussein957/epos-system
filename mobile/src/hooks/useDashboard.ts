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

export const useGetDashboard = () => {
  const { token } = useAuthStore();

  return useQuery<DashboardResponse, AxiosError<{ message?: string }>>({
    queryKey: ["dashboard"],
    enabled: !!token,
    queryFn: async () => {
      const { data } = await api.get<DashboardResponse>("/dashboard");
      return data;
    },
    staleTime: 1000 * 30, // 30 seconds (good for dashboards)
  });
};
