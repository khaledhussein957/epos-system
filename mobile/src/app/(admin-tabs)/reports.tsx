import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";

import {
  useDailySales,
  useLowStock,
  useRevenueByCashier,
  useTopProducts,
} from "@/hooks/useReports";

type Tab = "sales" | "top" | "stock" | "cashiers";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "sales", label: "Daily sales", icon: "chart.line.uptrend.xyaxis" },
  { key: "top", label: "Top products", icon: "star.fill" },
  { key: "stock", label: "Low stock", icon: "exclamationmark.triangle.fill" },
  { key: "cashiers", label: "By cashier", icon: "person.2.fill" },
];

const money = (n: number) =>
  `$${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ReportsScreen() {
  const [tab, setTab] = useState<Tab>("sales");

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-black dark:text-white">
          Reports
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4"
        contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
      >
        {TABS.map((t) => {
          const selected = t.key === tab;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              className={`flex-row items-center px-4 py-2 rounded-full border ${
                selected
                  ? "bg-primary border-primary"
                  : "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
              }`}
            >
              <SymbolView
                name={t.icon as never}
                size={14}
                tintColor={selected ? "white" : "#6B7280"}
              />
              <Text
                className={`ml-2 text-xs font-semibold ${
                  selected ? "text-white" : "text-black dark:text-white"
                }`}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {tab === "sales" && <DailySalesReport />}
      {tab === "top" && <TopProductsReport />}
      {tab === "stock" && <LowStockReport />}
      {tab === "cashiers" && <RevenueByCashierReport />}
    </SafeAreaView>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View className="pt-16 items-center">
      <Text className="text-gray-500 dark:text-gray-400">{text}</Text>
    </View>
  );
}

function Loading() {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator size="large" color="#7C3AED" />
    </View>
  );
}

function DailySalesReport() {
  const { data, isLoading, refetch, isFetching } = useDailySales();

  if (isLoading) return <Loading />;

  const totalOrders = data?.reduce((s, r) => s + r.orderCount, 0) ?? 0;
  const totalRevenue = data?.reduce((s, r) => s + r.revenue, 0) ?? 0;

  return (
    <ScrollView
      className="flex-1 px-4"
      refreshControl={
        <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
      }
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View className="flex-row gap-3 my-3">
        <SummaryCard label="Orders" value={totalOrders.toString()} />
        <SummaryCard label="Revenue" value={money(totalRevenue)} />
      </View>

      {!data || data.length === 0 ? (
        <Empty text="No sales recorded yet." />
      ) : (
        <View className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
          {data.map((row, i) => (
            <View
              key={row.date}
              className={`flex-row items-center px-4 py-3 ${
                i > 0 ? "border-t border-gray-100 dark:border-zinc-800" : ""
              }`}
            >
              <View className="flex-1">
                <Text className="font-semibold text-black dark:text-white">
                  {row.date}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {row.orderCount} order{row.orderCount === 1 ? "" : "s"}
                </Text>
              </View>
              <Text className="text-primary font-bold">{money(row.revenue)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function TopProductsReport() {
  const { data, isLoading, refetch, isFetching } = useTopProducts({ limit: 10 });

  if (isLoading) return <Loading />;

  return (
    <ScrollView
      className="flex-1 px-4"
      refreshControl={
        <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
      }
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {!data || data.length === 0 ? (
        <Empty text="No sales yet — nothing to rank." />
      ) : (
        <View className="mt-3 gap-2">
          {data.map((row, i) => (
            <View
              key={row.productId}
              className="flex-row items-center bg-white dark:bg-zinc-900 rounded-2xl p-3 border border-gray-100 dark:border-zinc-800"
            >
              <Text className="w-6 text-center text-gray-400 font-bold">
                {i + 1}
              </Text>
              <View className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 overflow-hidden mx-2">
                {row.imageUrl ? (
                  <Image
                    source={{ uri: row.imageUrl }}
                    contentFit="cover"
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : null}
              </View>
              <View className="flex-1">
                <Text
                  className="font-semibold text-black dark:text-white"
                  numberOfLines={1}
                >
                  {row.name}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {row.quantitySold} sold · {money(row.revenue)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function LowStockReport() {
  const { data, isLoading, refetch, isFetching } = useLowStock(5);

  if (isLoading) return <Loading />;

  return (
    <ScrollView
      className="flex-1 px-4"
      refreshControl={
        <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
      }
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {!data || data.length === 0 ? (
        <Empty text="Every product is above the low-stock threshold." />
      ) : (
        <View className="mt-3 gap-2">
          {data.map((row) => (
            <View
              key={row.id}
              className="flex-row items-center bg-white dark:bg-zinc-900 rounded-2xl p-3 border border-gray-100 dark:border-zinc-800"
            >
              <View className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 overflow-hidden mr-3">
                {row.imageUrl ? (
                  <Image
                    source={{ uri: row.imageUrl }}
                    contentFit="cover"
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : null}
              </View>
              <View className="flex-1">
                <Text
                  className="font-semibold text-black dark:text-white"
                  numberOfLines={1}
                >
                  {row.name}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {money(row.price)}
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${
                  row.stock <= 0
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-amber-100 dark:bg-amber-900/30"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    row.stock <= 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {row.stock <= 0 ? "OUT" : `${row.stock} LEFT`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function RevenueByCashierReport() {
  const { data, isLoading, refetch, isFetching } = useRevenueByCashier();

  if (isLoading) return <Loading />;

  return (
    <ScrollView
      className="flex-1 px-4"
      refreshControl={
        <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
      }
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {!data || data.length === 0 ? (
        <Empty text="No orders attributed to any cashier yet." />
      ) : (
        <View className="mt-3 gap-2">
          {data.map((row) => (
            <View
              key={row.userId}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800"
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text
                  className="font-semibold text-black dark:text-white"
                  numberOfLines={1}
                >
                  {row.name}
                </Text>
                <Text className="text-primary font-bold">{money(row.revenue)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {row.role.toUpperCase()} · {row.email}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {row.orderCount} order{row.orderCount === 1 ? "" : "s"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800">
      <Text className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
        {label}
      </Text>
      <Text className="text-xl font-bold text-black dark:text-white mt-1">
        {value}
      </Text>
    </View>
  );
}
