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
  Switch,
  ScrollView,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";

import { ICategory, IProduct } from "@/types";
import { useUpdateProduct } from "@/hooks/useProduct";
import {
  UpdateProductInput,
  updateProductSchema,
} from "@/validations/product.validate";

interface UpdateProductFormProps {
  visible: boolean;
  onClose: () => void;
  product: IProduct | null;
  categories: ICategory[];
}

const UpdateProductForm = ({
  visible,
  onClose,
  product,
  categories,
}: UpdateProductFormProps) => {
  const updateProduct = useUpdateProduct();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      price: 0,
      stock: 0,
      is_active: true,
      imageUri: "",
    },
  });

  useEffect(() => {
    if (!product) return;

    reset({
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      price: Number(product.price),
      stock: product.stock,
      is_active: product.is_active,
      imageUri: "",
    });
  }, [product, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: UpdateProductInput) => {
    if (!product) return;

    updateProduct.mutate(
      {
        id: product.id,
        name: data.name,
        description: data.description,
        category_id: data.category_id,
        price: data.price,
        stock: data.stock,
        is_active: data.is_active,
        imageUri: data.imageUri?.trim() ? data.imageUri.trim() : undefined,
      },
      {
        onSuccess: () => handleClose(),
      },
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
        <View className="bg-white dark:bg-zinc-900 rounded-t-3xl px-6 pt-4 pb-10 max-h-[88%]">
          <View className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full self-center mb-5" />

          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-black dark:text-white">
              Edit Product
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Leave image URI empty to keep the current image.
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Product Name"
                  placeholder="e.g. Wireless Mouse"
                  value={String(value ?? "")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Description"
                  placeholder="Short description"
                  value={String(value ?? "")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.description?.message}
                  multiline
                />
              )}
            />

            <Controller
              control={control}
              name="imageUri"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="New Image URI"
                  placeholder="file://... (optional)"
                  value={String(value ?? "")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.imageUri?.message}
                  autoCapitalize="none"
                />
              )}
            />

            <Text className="text-sm font-medium text-black dark:text-white mb-2">
              Category
            </Text>
            <Controller
              control={control}
              name="category_id"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row flex-wrap gap-2 mb-2">
                  {categories.map((category) => {
                    const selected = value === category.id;

                    return (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => onChange(category.id)}
                        className={`px-4 py-2 rounded-xl border ${selected ? "bg-primary border-primary" : "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"}`}
                      >
                        <Text
                          className={
                            selected
                              ? "text-white font-medium"
                              : "text-black dark:text-white"
                          }
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            />
            {errors.category_id ? (
              <Text className="text-red-500 mt-1 mb-4 text-sm">
                {errors.category_id.message}
              </Text>
            ) : null}

            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Price"
                  placeholder="0.00"
                  value={String(value ?? "")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.price?.message}
                  keyboardType="decimal-pad"
                />
              )}
            />

            <Controller
              control={control}
              name="stock"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Stock"
                  placeholder="0"
                  value={String(value ?? "")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.stock?.message}
                  keyboardType="number-pad"
                />
              )}
            />

            <Controller
              control={control}
              name="is_active"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row items-center justify-between border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 mb-6">
                  <View className="flex-1 pr-4">
                    <Text className="text-sm font-medium text-black dark:text-white">
                      Active Product
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Toggle availability for this product.
                    </Text>
                  </View>
                  <Switch value={value} onValueChange={onChange} />
                </View>
              )}
            />

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={updateProduct.isPending}
              className="bg-primary py-4 rounded-xl items-center"
            >
              {updateProduct.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  keyboardType?: "default" | "decimal-pad" | "number-pad";
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

const Field = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  keyboardType = "default",
  multiline = false,
  autoCapitalize = "sentences",
}: FieldProps) => (
  <View className="mb-4">
    <Text className="text-sm font-medium text-black dark:text-white mb-2">
      {label}
    </Text>
    <TextInput
      className={`border border-primary rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-800 ${multiline ? "min-h-[96px]" : ""}`}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      autoCapitalize={autoCapitalize}
      onBlur={onBlur}
      onChangeText={onChangeText}
      value={value}
      keyboardType={keyboardType}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
    />
    {error ? <Text className="text-red-500 mt-1 text-sm">{error}</Text> : null}
  </View>
);

export default UpdateProductForm;
