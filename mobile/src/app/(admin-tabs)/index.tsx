import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";

import { useGetDashboard } from "@/hooks/useDashboard";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: stats, isLoading, refetch, isFetching } = useGetDashboard();

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  // Empty state
  if (!stats) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <Text className="text-gray-500 dark:text-gray-400">
          No dashboard data available
        </Text>
      </View>
    );
  }

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en", {
      notation: "compact",
    }).format(value);

  const revenue = (stats.totalRevenue ?? 0).toLocaleString();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor="#7C3AED"
          />
        }
      >
        <Text className="text-2xl font-bold text-black dark:text-white mt-4 mb-6">
          Admin Dashboard
        </Text>

        {/* Stats */}
        <View className="flex-row flex-wrap justify-between">
          <StatCard
            title="Total Users"
            value={formatNumber(stats.totalUsers ?? 0)}
            icon="person.2.fill"
            color="#3B82F6"
          />
          <StatCard
            title="Total Orders"
            value={formatNumber(stats.totalOrders ?? 0)}
            icon="cart.fill"
            color="#10B981"
          />
          <StatCard
            title="Total Products"
            value={formatNumber(stats.totalProducts ?? 0)}
            icon="square.grid.2x2.fill"
            color="#F59E0B"
          />
          <StatCard
            title="Total Categories"
            value={formatNumber(stats.totalCategories ?? 0)}
            icon="list.bullet"
            color="#8B5CF6"
          />
        </View>

        {/* Revenue Card */}
        <View className="bg-white dark:bg-zinc-800 p-6 rounded-3xl mt-6 shadow-sm border border-gray-100 dark:border-zinc-700">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-black dark:text-white">
              Revenue Overview
            </Text>
          </View>

          <Text className="text-3xl font-black text-black dark:text-white">
            ${revenue}
          </Text>

          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            Total earnings from completed orders
          </Text>

          <View className="h-[2px] bg-gray-100 dark:bg-zinc-700 my-6" />

          <TouchableOpacity
            onPress={() => {}}
            className="flex-row items-center justify-center"
          >
            <Text className="text-primary font-bold mr-2">
              View Detailed Report
            </Text>
            <SymbolView name="chevron.right" size={14} tintColor="#7C3AED" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ✅ Memoized for better performance
const StatCard = React.memo(function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}) {
  return (
    <View className="w-[48%] bg-white dark:bg-zinc-800 p-4 rounded-3xl mb-4 shadow-sm border border-gray-100 dark:border-zinc-700">
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center mb-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <SymbolView name={icon} size={20} tintColor={color} />
      </View>

      <Text className="text-2xl font-black text-black dark:text-white">
        {value}
      </Text>

      <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium">
        {title}
      </Text>
    </View>
  );
});
