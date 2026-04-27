import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useGetProduct } from "@/hooks/useProduct";
import { useCartStore } from "@/store/cart.store";

const ProductDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: product,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useGetProduct(id ?? "");
  const addItem = useCartStore((state) => state.addItem);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black px-6">
        <SymbolView name="exclamationmark.triangle" size={48} tintColor="#EF4444" />
        <Text className="text-red-500 text-base mt-3 text-center font-bold">
          Failed to load product details
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="mt-6 px-8 py-3 rounded-2xl bg-primary"
        >
          <Text className="text-white font-bold">
            {isRefetching ? "Retrying..." : "Retry"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative">
          <Image
            source={{ uri: product.image_url || "https://via.placeholder.com/600" }}
            contentFit="cover"
            className="w-full h-[400px]"
          />
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-5 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 items-center justify-center shadow-sm"
          >
            <SymbolView name="chevron.left" size={20} tintColor="#000" />
          </TouchableOpacity>
        </View>

        <View className="px-6 -mt-10 bg-white dark:bg-black rounded-t-[40px] pt-8 pb-32">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-sm text-primary font-bold uppercase tracking-widest mb-1">
                {product.category?.name || "Premium Product"}
              </Text>
              <Text className="text-3xl font-black text-black dark:text-white">
                {product.name}
              </Text>
            </View>
            <Text className="text-2xl font-black text-primary">
              ${Number(product.price).toFixed(2)}
            </Text>
          </View>

          <View className="flex-row items-center mb-6">
            <View className="flex-row bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-lg items-center">
              <SymbolView name="star.fill" size={12} tintColor="#F59E0B" />
              <Text className="text-yellow-700 dark:text-yellow-500 font-bold ml-1 text-xs">4.8</Text>
            </View>
            <Text className="text-gray-400 ml-2 text-xs">(120 Reviews)</Text>
          </View>

          <Text className="text-lg font-bold text-black dark:text-white mb-2">Description</Text>
          <Text className="text-gray-500 dark:text-gray-400 leading-6 mb-8">
            {product.description || "No description available for this premium product. Experience the excellence of our latest collection."}
          </Text>

          <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-gray-50 dark:bg-zinc-900 p-4 rounded-3xl items-center border border-gray-100 dark:border-zinc-800">
               <SymbolView name="shippingbox.fill" size={20} tintColor="#7C3AED" />
               <Text className="text-black dark:text-white font-bold mt-2">{product.stock}</Text>
               <Text className="text-gray-400 text-[10px] uppercase font-bold">In Stock</Text>
            </View>
            <View className="flex-1 bg-gray-50 dark:bg-zinc-900 p-4 rounded-3xl items-center border border-gray-100 dark:border-zinc-800">
               <SymbolView name="checkmark.shield.fill" size={20} tintColor="#10B981" />
               <Text className="text-black dark:text-white font-bold mt-2">Authentic</Text>
               <Text className="text-gray-400 text-[10px] uppercase font-bold">Guaranteed</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View className="absolute bottom-0 w-full px-6 py-8 bg-white/90 dark:bg-black/90 border-t border-gray-100 dark:border-zinc-800 flex-row gap-4">
        <TouchableOpacity 
          onPress={() => {
            addItem(product);
            Alert.alert("Success", "Added to cart!");
          }}
          className="flex-1 h-14 bg-gray-100 dark:bg-zinc-800 rounded-2xl items-center justify-center"
        >
          <Text className="text-black dark:text-white font-bold">Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 h-14 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/30">
          <Text className="text-white font-bold">Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetailsScreen;
