import React from "react";
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

import { useCreateCategory } from "@/hooks/useCategory";

import {
  CreateCategoryInput,
  createCategorySchema,
} from "@/validations/category.validate";

interface CreateCategoryFormProps {
  visible: boolean;
  onClose: () => void;
}

const CreateCategoryForm = ({ visible, onClose }: CreateCategoryFormProps) => {
  const createCategory = useCreateCategory();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "" },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: CreateCategoryInput) => {
    createCategory.mutate(data, {
      onSuccess: () => handleClose(),
    });
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
              New Category
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
            disabled={createCategory.isPending}
            className="bg-primary py-4 rounded-xl items-center"
          >
            {createCategory.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Create Category
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateCategoryForm;
