import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Image } from "expo-image";

import { useGetCategories } from "@/hooks/useCategory";
import { useGetProducts } from "@/hooks/useProduct";
import CategoryCard from "@/components/category_card";
import ProductCard from "@/components/product_card";
import { ICategory } from "@/types";
import { useAuthStore } from "@/store/auth.store";

export default function Index() {
  // ✅ Auth state
  const { user } = useAuthStore();

  // ✅ Queries
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useGetCategories();

  const {
    data: products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useGetProducts();

  // ✅ Local state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let result = products;

    if (selectedCategoryId !== "all") {
      result = result.filter((p) => p.category_id === selectedCategoryId);
    }

    if (searchQuery.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return result;
  }, [products, selectedCategoryId, searchQuery]);

  // ✅ Categories list
  const allCategoryItem: ICategory = {
    id: "all",
    name: "All",
    image_url: "https://via.placeholder.com/100",
  };

  const categoriesList = categories
    ? [allCategoryItem, ...categories]
    : [allCategoryItem];

  // ✅ Error handling
  const hasQueryError = !!categoriesError || !!productsError;

  const errorMessage =
    categoriesError instanceof Error
      ? categoriesError.message
      : productsError instanceof Error
        ? productsError.message
        : "Failed to load home data.";

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      {/* 🔹 Header */}
      <View className="flex-row items-center justify-between px-4 mt-4">
        <Text className="text-2xl font-bold text-black dark:text-white">
          Welcome {user?.name || "Guest"}
        </Text>

        <Image
          source={{
            uri: user?.profilePicture || user?.name.charAt(0).toUpperCase(),
          }}
          className="w-10 h-10 rounded-full"
        />
      </View>

      {/* 🔹 Search */}
      <View className="px-4 mt-4">
        <Text className="text-sm font-medium text-black dark:text-white mb-2">
          Search
        </Text>

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="border border-primary rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-800"
          placeholder="Search for products"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* 🔹 Categories */}
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold text-black dark:text-white mb-4">
          Category
        </Text>

        {hasQueryError && (
          <View className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <Text className="font-semibold text-red-700">
              Could not load data
            </Text>
            <Text className="mt-1 text-sm text-red-600">{errorMessage}</Text>
          </View>
        )}

        {isLoadingCategories ? (
          <ActivityIndicator size="small" color="#7C3AED" />
        ) : (
          <FlatList
            data={categoriesList}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                isSelected={selectedCategoryId === item.id}
                onPress={() => setSelectedCategoryId(item.id)}
              />
            )}
            className="mb-2"
          />
        )}
      </View>

      {/* 🔹 Products */}
      {isLoadingProducts ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{
            gap: 16,
            paddingHorizontal: 16,
          }}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View className="flex-[0.5]">
              <ProductCard product={item} />
            </View>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-10">
              <Text className="text-gray-500 dark:text-gray-400">
                No products found.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
