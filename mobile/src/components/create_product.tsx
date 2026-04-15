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

import { ICategory } from "@/types";
import { useCreateProduct } from "@/hooks/useProduct";
import {
  CreateProductInput,
  createProductSchema,
} from "@/validations/product.validate";

interface CreateProductFormProps {
  visible: boolean;
  onClose: () => void;
  categories: ICategory[];
}

const initialValues = (categories: ICategory[]): CreateProductInput => ({
  name: "",
  description: "",
  category_id: categories[0]?.id ?? "",
  price: 0,
  stock: 0,
  is_active: true,
  imageUri: "",
});

const CreateProductForm = ({
  visible,
  onClose,
  categories,
}: CreateProductFormProps) => {
  const createProduct = useCreateProduct();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialValues(categories),
  });

  const selectedCategory = watch("category_id");

  useEffect(() => {
    if (!selectedCategory && categories[0]?.id) {
      setValue("category_id", categories[0].id);
    }
  }, [categories, selectedCategory, setValue]);

  const handleClose = () => {
    reset(initialValues(categories));
    onClose();
  };

  const onSubmit = (data: CreateProductInput) => {
    createProduct.mutate(data, {
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
        <View className="bg-white dark:bg-zinc-900 rounded-t-3xl px-6 pt-4 pb-10 max-h-[88%]">
          <View className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full self-center mb-5" />

          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-black dark:text-white">
              New Product
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
              Paste a local image URI like `file://...` until the app gets an
              image picker.
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
                  label="Image URI"
                  placeholder="file://..."
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
                  value={value === 0 ? "" : String(value)}
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
                  value={value === 0 ? "" : String(value)}
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
                      Inactive products stay visible but can be marked off sale.
                    </Text>
                  </View>
                  <Switch value={value} onValueChange={onChange} />
                </View>
              )}
            />

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={createProduct.isPending || categories.length === 0}
              className="bg-primary py-4 rounded-xl items-center"
            >
              {createProduct.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Create Product
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

export default CreateProductForm;
