import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetCategories } from "@/hooks/useCategory";
import { useGetProducts } from "@/hooks/useProduct";
import ProductCard from "@/components/product_card";
import { ICategory } from "@/types";

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const { data: categories, isLoading: isLoadingCategories } = useGetCategories();
  const { data: products, isLoading: isLoadingProducts } = useGetProducts();

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

  const categoriesList = categories
    ? [{ id: "all", name: "All" } as ICategory, ...categories]
    : [{ id: "all", name: "All" } as ICategory];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold text-black dark:text-white mb-4">
          Explore Products
        </Text>

        {/* Search Bar */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-800 mb-4"
          placeholder="Search products..."
          placeholderTextColor="#9CA3AF"
        />

        {/* Categories Horizontal Scroll */}
        <View className="mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categoriesList.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategoryId(cat.id)}
                className={`mr-2 px-4 py-2 rounded-full border ${
                  selectedCategoryId === cat.id
                    ? "bg-primary border-primary"
                    : "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedCategoryId === cat.id ? "text-white" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

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
