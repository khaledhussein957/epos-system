import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetMyOrders } from "@/hooks/useOrder";
import { format } from "date-fns";

export default function OrdersScreen() {
  const { data: orders, isLoading, error } = useGetMyOrders();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold text-black dark:text-white mb-6">
          My Orders
        </Text>

        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="bg-white dark:bg-zinc-800 p-4 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-zinc-700">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold text-black dark:text-white">
                  Order #{item.id}
                </Text>
                <Text className="text-primary font-semibold">
                  {item.payment_method}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500 dark:text-gray-400">
                  {format(new Date(item.created_at), "PPP")}
                </Text>
                <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  <Text className="text-green-700 dark:text-green-400 text-xs font-bold uppercase">
                    Completed
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-gray-500 dark:text-gray-400">
                You haven't placed any orders yet.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}
