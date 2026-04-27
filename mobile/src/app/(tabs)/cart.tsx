import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { useCartStore } from "@/store/cart.store";

const CartScreen = () => {
  const router = useRouter();
  const { items, removeItem, clearCart } = useCartStore();

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View className="px-5 pt-14 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-900 items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-black dark:text-white">
              Cart
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {items.length} items
            </Text>
          </View>
        </View>

        {items.length > 0 ? (
          <TouchableOpacity onPress={clearCart}>
            <Text className="text-red-500 font-semibold">Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl px-4 py-4 mb-3 shadow-sm">
            <View className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 mr-3">
              {item.product.image_url ? (
                <Image
                  source={{ uri: item.product.image_url }}
                  contentFit="cover"
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Ionicons name="image-outline" size={22} color="#9CA3AF" />
                </View>
              )}
            </View>

            <View className="flex-1">
              <Text
                className="text-base font-semibold text-black dark:text-white"
                numberOfLines={1}
              >
                {item.product.name}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Qty {item.quantity}
              </Text>
              <Text className="text-primary font-semibold mt-2">
                ${Number(item.product.price).toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => removeItem(item.product.id)}
              className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 items-center justify-center"
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-24 px-6">
            <Ionicons name="cart-outline" size={56} color="#D1D5DB" />
            <Text className="text-gray-400 mt-3 text-base text-center">
              Your cart is empty
            </Text>
          </View>
        }
      />

      <View className="absolute bottom-0 left-0 right-0 px-5 py-5 bg-white dark:bg-black border-t border-gray-100 dark:border-zinc-800">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Total
          </Text>
          <Text className="text-2xl font-bold text-black dark:text-white">
            ${total.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          disabled={items.length === 0}
          className={`py-4 rounded-2xl items-center ${items.length === 0 ? "bg-gray-300 dark:bg-zinc-800" : "bg-primary"}`}
        >
          <Text className="text-white font-semibold text-base">
            Checkout Soon
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartScreen;
