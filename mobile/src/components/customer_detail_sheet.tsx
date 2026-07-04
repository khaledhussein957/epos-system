import React from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { format } from "date-fns";
import { SymbolView } from "expo-symbols";

import { useGetCustomerHistory } from "@/hooks/useCustomer";
import type { ICustomer } from "@/types";

const money = (n: number) =>
  `$${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface Props {
  customer: ICustomer | null;
  onClose: () => void;
}

export const CustomerDetailSheet = ({ customer, onClose }: Props) => {
  const { data, isLoading } = useGetCustomerHistory(customer?.id);

  return (
    <Modal
      visible={!!customer}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} className="flex-1 bg-black/50" />
      <View className="bg-white dark:bg-zinc-900 rounded-t-3xl max-h-[85%]">
        <View className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full self-center my-3" />
        <View className="flex-row items-center justify-between px-6 pb-3">
          <View className="flex-1">
            <Text
              className="text-xl font-bold text-black dark:text-white"
              numberOfLines={1}
            >
              {customer?.name}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {customer?.email} · {customer?.phone}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 items-center justify-center"
          >
            <SymbolView name="xmark" size={14} tintColor="#6B7280" />
          </TouchableOpacity>
        </View>

        {isLoading || !data ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : (
          <ScrollView
            className="px-6"
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <View className="flex-row gap-3 mb-4">
              <SummaryCard
                label="Orders"
                value={data.orderCount.toString()}
              />
              <SummaryCard
                label="Lifetime spend"
                value={money(data.lifetimeSpend)}
              />
            </View>

            {data.orders.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-gray-500 dark:text-gray-400">
                  No orders on file yet.
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {data.orders.map((order) => (
                  <View
                    key={String(order.id)}
                    className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-3 border border-gray-100 dark:border-zinc-700"
                  >
                    <View className="flex-row justify-between items-center">
                      <Text
                        className="font-semibold text-black dark:text-white"
                        numberOfLines={1}
                      >
                        Order #{String(order.id).slice(0, 8)}
                      </Text>
                      <Text className="text-primary font-bold">
                        {money(Number((order as any).total ?? 0))}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(order.created_at), "PPP")}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        {order.payment_method}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-2xl p-4 border border-gray-100 dark:border-zinc-700">
      <Text className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
        {label}
      </Text>
      <Text className="text-xl font-bold text-black dark:text-white mt-1">
        {value}
      </Text>
    </View>
  );
}
