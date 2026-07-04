import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";

import { useGetProducts, useDeleteProduct } from "@/hooks/useProduct";
import { useGetCategories } from "@/hooks/useCategory";
import { ProductForm } from "@/components/product_form";
import { StockAdjustSheet } from "@/components/stock_adjust_sheet";
import type { IProduct } from "@/types";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<IProduct | null>(null);
  const [adjusting, setAdjusting] = useState<IProduct | null>(null);

  const { data: products, isLoading, refetch, isFetching } = useGetProducts();
  const { data: categories } = useGetCategories();
  const deleteProduct = useDeleteProduct();

  const filtered = products?.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.barcode?.toLowerCase().includes(q) ?? false)
    );
  });

  const handleDelete = (product: IProduct) => {
    Alert.alert(
      "Delete Product",
      `Delete ${product.name}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteProduct.mutate({ id: product.id, password: "" }),
        },
      ],
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
          onPress={() => setCreating(true)}
          className="bg-primary p-2 rounded-xl"
          accessibilityLabel="Add product"
        >
          <SymbolView name="plus" size={20} tintColor="white" />
        </TouchableOpacity>
      </View>

      <View className="px-4 pb-2">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or barcode…"
          placeholderTextColor="#9CA3AF"
          className="border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-800"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={isFetching && !isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <View className="bg-white dark:bg-zinc-800 p-3 rounded-2xl mb-4 mx-4 shadow-sm border border-gray-100 dark:border-zinc-700 flex-row items-center">
            <Image
              source={{
                uri: item.image_url || "https://via.placeholder.com/100",
              }}
              className="w-16 h-16 rounded-xl"
            />
            <View className="flex-1 ml-4">
              <Text
                className="text-lg font-bold text-black dark:text-white"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text className="text-primary font-bold">
                ${Number(item.price).toFixed(2)}
              </Text>
              <Text
                className={`text-xs ${
                  item.stock <= 0
                    ? "text-red-500"
                    : item.stock <= 5
                      ? "text-amber-500"
                      : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Stock: {item.stock}
                {item.barcode ? ` · ${item.barcode}` : ""}
              </Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setAdjusting(item)}
                className="p-2 mr-1"
                accessibilityLabel={`Adjust stock for ${item.name}`}
              >
                <SymbolView
                  name="tray.and.arrow.down.fill"
                  size={18}
                  tintColor="#7C3AED"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEditing(item)}
                className="p-2 mr-1"
                accessibilityLabel={`Edit ${item.name}`}
              >
                <SymbolView name="pencil" size={18} tintColor="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2"
                onPress={() => handleDelete(item)}
                accessibilityLabel={`Delete ${item.name}`}
              >
                <SymbolView name="trash.fill" size={18} tintColor="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-gray-500 dark:text-gray-400">
              {search ? "No matches." : "No products found."}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <ProductForm
        mode="create"
        visible={creating}
        onClose={() => setCreating(false)}
        categories={categories ?? []}
      />
      <ProductForm
        mode="update"
        visible={!!editing}
        product={editing}
        onClose={() => setEditing(null)}
        categories={categories ?? []}
      />
      <StockAdjustSheet product={adjusting} onClose={() => setAdjusting(null)} />
    </SafeAreaView>
  );
}
