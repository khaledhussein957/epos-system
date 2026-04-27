import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetProducts, useDeleteProduct } from "@/hooks/useProduct";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";

export default function AdminProducts() {
  const { data: products, isLoading, refetch } = useGetProducts();
  const deleteProduct = useDeleteProduct();
  const router = useRouter();

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteProduct.mutate({ id, password: "" }) // Password logic might need update based on API
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <View className="px-4 py-4 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-black dark:text-white">
          Products
        </Text>
        <TouchableOpacity 
          onPress={() => {}} // Navigate to add product
          className="bg-primary p-2 rounded-xl"
        >
          <SymbolView name="plus" size={20} tintColor="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white dark:bg-zinc-800 p-3 rounded-2xl mb-4 mx-4 shadow-sm border border-gray-100 dark:border-zinc-700 flex-row items-center">
            <Image
              source={{ uri: item.image_url || "https://via.placeholder.com/100" }}
              className="w-16 h-16 rounded-xl"
            />
            <View className="flex-1 ml-4">
              <Text className="text-lg font-bold text-black dark:text-white" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-primary font-bold">
                ${item.price}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs">
                Stock: {item.stock}
              </Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity className="p-2 mr-2">
                <SymbolView name="pencil" size={18} tintColor="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity 
                className="p-2"
                onPress={() => handleDelete(item.id)}
              >
                <SymbolView name="trash.fill" size={18} tintColor="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-gray-500 dark:text-gray-400">
              No products found.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
