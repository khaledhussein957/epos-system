import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SymbolView } from "expo-symbols";

import { useAdjustStock } from "@/hooks/useStockAdjustment";
import type { IProduct } from "@/types";

interface Props {
  product: IProduct | null;
  onClose: () => void;
}

export const StockAdjustSheet = ({ product, onClose }: Props) => {
  const [deltaInput, setDeltaInput] = useState("");
  const [reason, setReason] = useState("");
  const [sign, setSign] = useState<1 | -1>(1);

  const adjust = useAdjustStock();

  useEffect(() => {
    if (product) {
      setDeltaInput("");
      setReason("");
      setSign(1);
    }
  }, [product]);

  const magnitude = Math.max(Math.floor(Number(deltaInput) || 0), 0);
  const delta = magnitude * sign;
  const currentStock = product?.stock ?? 0;
  const nextStock = currentStock + delta;
  const overflow = nextStock < 0;

  const handleSubmit = () => {
    if (!product || magnitude === 0 || overflow) return;
    adjust.mutate(
      {
        productId: product.id,
        delta,
        reason: reason.trim() || undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      visible={!!product}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} className="flex-1 bg-black/50" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="bg-white dark:bg-zinc-900 rounded-t-3xl px-6 pt-4 pb-8">
          <View className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full self-center mb-4" />

          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-xl font-bold text-black dark:text-white">
                Adjust stock
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {product?.name} · currently {currentStock}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 items-center justify-center"
            >
              <SymbolView name="xmark" size={14} tintColor="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              onPress={() => setSign(1)}
              className={`flex-1 py-3 rounded-xl items-center ${
                sign === 1
                  ? "bg-green-500"
                  : "bg-gray-100 dark:bg-zinc-800"
              }`}
            >
              <View className="flex-row items-center">
                <SymbolView
                  name="plus"
                  size={14}
                  tintColor={sign === 1 ? "white" : "#374151"}
                />
                <Text
                  className={`ml-1 font-semibold ${
                    sign === 1 ? "text-white" : "text-black dark:text-white"
                  }`}
                >
                  Receive
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSign(-1)}
              className={`flex-1 py-3 rounded-xl items-center ${
                sign === -1
                  ? "bg-red-500"
                  : "bg-gray-100 dark:bg-zinc-800"
              }`}
            >
              <View className="flex-row items-center">
                <SymbolView
                  name="minus"
                  size={14}
                  tintColor={sign === -1 ? "white" : "#374151"}
                />
                <Text
                  className={`ml-1 font-semibold ${
                    sign === -1 ? "text-white" : "text-black dark:text-white"
                  }`}
                >
                  Remove
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
            Quantity
          </Text>
          <TextInput
            value={deltaInput}
            onChangeText={setDeltaInput}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            className={`border rounded-xl px-3 py-3 mb-1 text-black dark:text-white bg-white dark:bg-zinc-800 ${
              overflow ? "border-red-500" : "border-gray-200 dark:border-zinc-700"
            }`}
          />
          {overflow ? (
            <Text className="text-xs text-red-500 mb-3">
              Removing {magnitude} would drop stock below zero.
            </Text>
          ) : (
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              After adjustment: {nextStock}
            </Text>
          )}

          <Text className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
            Reason (optional)
          </Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="e.g. supplier delivery, shrinkage, breakage…"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-3 mb-4 text-black dark:text-white bg-white dark:bg-zinc-800"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={magnitude === 0 || overflow || adjust.isPending}
            className={`py-4 rounded-xl items-center ${
              magnitude === 0 || overflow || adjust.isPending
                ? "bg-gray-300 dark:bg-zinc-700"
                : "bg-primary"
            }`}
          >
            {adjust.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">
                {sign === 1 ? "+" : "−"}
                {magnitude || 0} unit{magnitude === 1 ? "" : "s"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
