import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { api } from "../lib/axios";
import { notify } from "../lib/notify";

interface AdjustStockPayload {
  productId: string;
  delta: number;
  reason?: string;
}

export const useAdjustStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["stock", "adjust"],
    mutationFn: async ({ productId, delta, reason }: AdjustStockPayload) => {
      const { data } = await api.post(`/products/${productId}/adjust-stock`, {
        delta,
        reason,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["reports", "low-stock"] });
      notify.success("Stock adjusted");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error(
        "Failed to adjust stock",
        error.response?.data?.message ?? "Try again.",
      );
    },
  });
};
