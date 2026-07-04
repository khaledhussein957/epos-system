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
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";

import { ICategory, IProduct } from "@/types";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProduct";
import {
  CreateProductInput,
  UpdateProductInput,
  createProductSchema,
  updateProductSchema,
} from "@/validations/product.validate";

type ProductFormProps =
  | {
      mode: "create";
      visible: boolean;
      onClose: () => void;
      categories: ICategory[];
      product?: never;
    }
  | {
      mode: "update";
      visible: boolean;
      onClose: () => void;
      categories: ICategory[];
      product: IProduct | null;
    };

type FormValues = CreateProductInput | UpdateProductInput;

const createDefaults = (categories: ICategory[]): CreateProductInput => ({
  name: "",
  description: "",
  category_id: categories[0]?.id ?? "",
  price: 0,
  stock: 0,
  is_active: true,
  imageUri: "",
  barcode: "",
});

const updateDefaultsFromProduct = (product: IProduct): UpdateProductInput => ({
  name: product.name,
  description: product.description,
  category_id: product.category_id,
  price: Number(product.price),
  stock: Number(product.stock),
  is_active: product.is_active,
  imageUri: "",
  barcode: product.barcode ?? "",
});

export const ProductForm = (props: ProductFormProps) => {
  const { mode, visible, onClose, categories } = props;
  const product = mode === "update" ? props.product : null;

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const mutation = mode === "create" ? createProduct : updateProduct;

  const schema = mode === "create" ? createProductSchema : updateProductSchema;
  const defaultValues =
    mode === "create"
      ? createDefaults(categories)
      : product
        ? updateDefaultsFromProduct(product)
        : createDefaults(categories);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues,
  });

  const selectedCategory = watch("category_id");

  useEffect(() => {
    if (mode === "create" && !selectedCategory && categories[0]?.id) {
      setValue("category_id", categories[0].id);
    }
  }, [mode, categories, selectedCategory, setValue]);

  useEffect(() => {
    if (mode === "update" && product) {
      reset(updateDefaultsFromProduct(product));
    }
  }, [mode, product, reset]);

  const handleClose = () => {
    reset(mode === "create" ? createDefaults(categories) : undefined);
    onClose();
  };

  const onSubmit = (data: FormValues) => {
    if (mode === "create") {
      createProduct.mutate(data as CreateProductInput, {
        onSuccess: handleClose,
      });
      return;
    }

    if (!product) return;
    const update = data as UpdateProductInput;
    updateProduct.mutate(
      {
        id: product.id,
        name: update.name,
        description: update.description,
        category_id: update.category_id,
        price: update.price,
        stock: update.stock,
        is_active: update.is_active,
        imageUri: update.imageUri?.trim() ? update.imageUri.trim() : undefined,
        barcode:
          update.barcode === undefined
            ? undefined
            : update.barcode.trim()
              ? update.barcode.trim()
              : null,
      },
      { onSuccess: handleClose },
    );
  };

  const title = mode === "create" ? "New Product" : "Edit Product";
  const cta = mode === "create" ? "Create Product" : "Save Changes";
  const helper =
    mode === "create"
      ? "Paste a local image URI like `file://...` until the app gets an image picker."
      : "Leave image URI empty to keep the current image.";
  const imageLabel = mode === "create" ? "Image URI" : "New Image URI";
  const imagePlaceholder =
    mode === "create" ? "file://..." : "file://... (optional)";

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
              {title}
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
              {helper}
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
                  label={imageLabel}
                  placeholder={imagePlaceholder}
                  value={String(value ?? "")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.imageUri?.message}
                  autoCapitalize="none"
                />
              )}
            />

            <Controller
              control={control}
              name="barcode"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Barcode (optional)"
                  placeholder="EAN / UPC / QR"
                  value={String(value ?? "")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.barcode?.message}
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
                  onChangeText={(text) => onChange(text === "" ? 0 : Number(text))}
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
                  onChangeText={(text) => onChange(text === "" ? 0 : Number(text))}
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
              disabled={mutation.isPending || categories.length === 0}
              className="bg-primary py-4 rounded-xl items-center"
            >
              {mutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">{cta}</Text>
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

export default ProductForm;
