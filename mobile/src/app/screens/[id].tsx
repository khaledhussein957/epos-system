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
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

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

  const categoryName = product?.category?.name ?? "Unknown category";

  const productImageUri = getProductImageUri(product);

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
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-red-500 text-base mt-3 text-center">
          Failed to load product details
        </Text>
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="px-5 py-3 rounded-xl bg-gray-200 dark:bg-zinc-800"
          >
            <Text className="text-black dark:text-white font-semibold">
              Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => refetch()}
            className="px-5 py-3 rounded-xl bg-primary"
          >
            <Text className="text-white font-semibold">
              {isRefetching ? "Retrying..." : "Retry"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative">
          <View className="h-80 bg-gray-100 dark:bg-zinc-900">
            {productImageUri ? (
              <Image
                source={{ uri: productImageUri }}
                contentFit="contain"
                transition={150}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="image-outline" size={48} color="#9CA3AF" />
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-14 left-5 w-11 h-11 rounded-full bg-black/35 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="px-5 pt-5 pb-10">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-black dark:text-white">
                {product.name}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {categoryName}
              </Text>
            </View>

            <View
              className={`px-3 py-1.5 rounded-full ${product.is_active ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-gray-200 dark:bg-zinc-800"}`}
            >
              <Text
                className={`text-xs font-semibold ${product.is_active ? "text-emerald-700 dark:text-emerald-300" : "text-gray-600 dark:text-gray-300"}`}
              >
                {product.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          <Text className="text-primary text-3xl font-bold mt-5">
            ${Number(product.price).toFixed(2)}
          </Text>

          <Text className="text-base leading-7 text-gray-700 dark:text-gray-300 mt-5">
            {product.description}
          </Text>

          <TouchableOpacity
            onPress={() => {
              addItem(product);
              Alert.alert(
                "Added to cart",
                `${product.name} was added to cart`,
                [
                  { text: "Keep Shopping", style: "cancel" },
                  {
                    text: "Open Cart",
                    onPress: () => router.push("/screens/cart"),
                  },
                ],
              );
            }}
            className="mt-6 bg-primary py-4 rounded-2xl items-center"
          >
            <Text className="text-white font-semibold text-base">
              Add To Cart
            </Text>
          </TouchableOpacity>

          <View className="flex-row gap-3 mt-6">
            <InfoCard
              icon="cube-outline"
              label="Stock"
              value={String(product.stock)}
            />
            <InfoCard
              icon="qr-code-outline"
              label="QR Code"
              value={product.qr_code ? "Available" : "Missing"}
            />
          </View>

          {product.qr_code ? (
            <View className="mt-6 bg-gray-50 dark:bg-zinc-900 rounded-3xl p-4">
              <Text className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                QR Code
              </Text>
              <View className="items-center justify-center bg-white rounded-2xl p-4">
                <Image
                  source={{ uri: product.qr_code }}
                  contentFit="contain"
                  style={{ width: 220, height: 220 }}
                />
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) => (
  <View className="flex-1 bg-gray-50 dark:bg-zinc-900 rounded-2xl p-4">
    <Ionicons name={icon} size={20} color="#7C3AED" />
    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-3">
      {label}
    </Text>
    <Text className="text-lg font-semibold text-black dark:text-white mt-1">
      {value}
    </Text>
  </View>
);

const getProductImageUri = (product: unknown) => {
  if (!product || typeof product !== "object") {
    return null;
  }

  const candidate =
    (product as { image_url?: string | null }).image_url ??
    (product as { image?: string | null }).image;

  return typeof candidate === "string" && candidate.trim() ? candidate : null;
};

export default ProductDetailsScreen;
