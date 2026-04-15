import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { ICategory } from "@/types";

interface CategoryCardProps {
  category: ICategory;
  isAdmin?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
  onEdit?: (category: ICategory) => void;
  onDelete?: (category: ICategory) => void;
}

const CategoryCard = ({
  category,
  isAdmin,
  isSelected,
  onPress,
  onEdit,
  onDelete,
}: CategoryCardProps) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.8}
      onPress={onPress}
      className={`flex-row items-center bg-white dark:bg-zinc-900 border ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-gray-100 dark:border-zinc-800"
      } rounded-2xl px-4 py-3 mr-3 shadow-sm ${!onPress ? "mb-3" : ""}`}
    >
      <View
        className={`w-10 h-10 rounded-xl ${
          isSelected ? "bg-primary" : "bg-primary/10"
        } items-center justify-center mr-3 overflow-hidden`}
      >
        {category.image_url ? (
          <Image
            source={{ uri: category.image_url }}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Ionicons
            name="pricetag-outline"
            size={20}
            color={isSelected ? "white" : "#7C3AED"}
          />
        )}
      </View>

      <Text
        className={`text-base font-semibold ${
          isSelected ? "text-primary" : "text-black dark:text-white"
        }`}
        numberOfLines={1}
      >
        {category.name}
      </Text>

      {isAdmin && onEdit && onDelete && (
        <View className="flex-row gap-2 ml-4">
          <TouchableOpacity
            onPress={() => onEdit(category)}
            className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 items-center justify-center"
            accessibilityLabel={`Edit ${category.name}`}
          >
            <Ionicons name="pencil-outline" size={16} color="#3B82F6" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDelete(category.id as any)}
            className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 items-center justify-center"
            accessibilityLabel={`Delete ${category.name}`}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
    </Container>
  );
};

export default CategoryCard;
