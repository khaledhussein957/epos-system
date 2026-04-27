import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetCategories, useDeleteCategory } from "@/hooks/useCategory";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";

import { BottomSheet } from "@/components/bottomSheet";
import CreateCategoryForm from "@/app/screens/categories/create_category";

export default function AdminCategories() {
  const [open, setOpen] = React.useState(false);

  const {
    data: categories,
    isLoading,
    refetch,
    isFetching,
  } = useGetCategories();

  const deleteCategory = useDeleteCategory();

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCategory.mutate({ id, password: "" }),
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
      {/* HEADER */}
      <View className="px-4 py-4 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-black dark:text-white">
          Categories
        </Text>
      </View>

      {/* LIST */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        renderItem={({ item }) => (
          <View className="bg-white dark:bg-zinc-800 p-3 rounded-2xl mb-4 mx-4 shadow-sm border border-gray-100 dark:border-zinc-700 flex-row items-center">
            <Image
              source={{
                uri: item.image_url || "https://via.placeholder.com/100",
              }}
              className="w-12 h-12 rounded-xl"
            />

            <View className="flex-1 ml-4">
              <Text className="text-lg font-bold text-black dark:text-white">
                {item.name}
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
              No categories found.
            </Text>
          </View>
        }
      />

      {/* 🔥 FLOATING ACTION BUTTON (FAB) */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <SymbolView name="plus" size={24} tintColor="white" />
      </TouchableOpacity>

      {/* 🔥 BOTTOM SHEET */}
      <BottomSheet visible={open} onClose={() => setOpen(false)}>
        <CreateCategoryForm visible={open} onClose={() => setOpen(false)} />
      </BottomSheet>
    </SafeAreaView>
  );
}
