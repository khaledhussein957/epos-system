import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetOrders } from "@/hooks/useOrder";
import { format } from "date-fns";
import { SymbolView } from "expo-symbols";

export default function AdminOrders() {
  const { data: orders, isLoading } = useGetOrders();

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
          Customer Orders
        </Text>

        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity className="bg-white dark:bg-zinc-800 p-4 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-zinc-700">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold text-black dark:text-white">
                  Order #{item.id}
                </Text>
                <Text className="text-primary font-semibold">
                  ${item.items?.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) || 0}
                </Text>
              </View>
              
              <Text className="text-gray-600 dark:text-gray-300 mb-2">
                Customer: {item.customer_info || "Anonymous"}
              </Text>

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500 dark:text-gray-400 text-xs">
                  {format(new Date(item.created_at), "PPP p")}
                </Text>
                <View className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  <Text className="text-blue-700 dark:text-blue-400 text-xs font-bold uppercase">
                    {item.payment_method}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-gray-500 dark:text-gray-400">
                No orders found.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
