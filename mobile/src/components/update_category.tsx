import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";

import { ICategory } from "@/types";
import { useUpdateCategory } from "@/hooks/useCategory";

import {
  UpdateCategoryInput,
  updateCategorySchema,
} from "@/validations/category.validate";

interface UpdateCategoryFormProps {
  visible: boolean;
  onClose: () => void;
  category: ICategory | null;
}

const UpdateCategoryForm = ({
  visible,
  onClose,
  category,
}: UpdateCategoryFormProps) => {
  const updateCategory = useUpdateCategory();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateCategoryInput>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: { name: category?.name ?? "" },
  });

  useEffect(() => {
    if (category) {
      reset({ name: category.name });
    }
  }, [category, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: UpdateCategoryInput) => {
    if (!category) return;
    updateCategory.mutate(
      { id: String(category.id), name: data.name },
      { onSuccess: () => handleClose() },
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable className="flex-1 bg-black/50" onPress={handleClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="bg-white dark:bg-zinc-900 rounded-t-3xl px-6 pt-4 pb-10">
          <View className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full self-center mb-5" />

          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-black dark:text-white">
              Edit Category
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-black dark:text-white mb-2">
              Category Name
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-primary rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-800"
                  placeholder="e.g. Mobile Games"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  autoFocus
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.name && (
              <Text className="text-red-500 mt-1 text-sm">
                {errors.name.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={updateCategory.isPending}
            className="bg-primary py-4 rounded-xl items-center"
          >
            {updateCategory.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default UpdateCategoryForm;
