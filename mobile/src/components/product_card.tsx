import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { useCartStore } from "@/store/cart.store";
import { IProduct } from "@/types";

interface ProductCardProps {
  product: IProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const productImageUri = getProductImageUri(product);
  const addItem = useCartStore((state) => state.addItem);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/screens/[id]",
          params: { id: product.id },
        })
      }
      className="bg-white dark:bg-zinc-900 rounded-2xl mb-4 overflow-hidden border border-gray-100 dark:border-zinc-800"
    >
      {/* Image */}
      <View className="w-full h-36 bg-gray-100 dark:bg-zinc-800">
        {productImageUri ? (
          <Image
            source={{ uri: productImageUri }}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="image-outline" size={28} color="#9CA3AF" />
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-3">
        <Text
          className="text-sm font-semibold text-black dark:text-white"
          numberOfLines={1}
        >
          {product.name}
        </Text>

        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-primary text-base font-bold">
            ${Number(product.price).toFixed(2)}
          </Text>

          <TouchableOpacity
            onPress={() => addItem(product)}
            className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
          >
            <Ionicons name="cart-outline" size={20} color="#7C3AED" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getProductImageUri = (product: unknown) => {
  if (!product || typeof product !== "object") return null;

  const candidate =
    (product as { image_url?: string | null }).image_url ??
    (product as { image?: string | null }).image;

  return typeof candidate === "string" && candidate.trim() ? candidate : null;
};

export default ProductCard;
