import React, { useEffect, useRef, useState } from "react";
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
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";
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

  const inputRef = useRef<TextInput>(null);
  const [image, setImage] = useState<string | null>(null);

  // 🔥 shake animation
  const shake = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "", image_url: "" },
  });

  // 🧠 auto-focus when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [visible]);

  const handleClose = () => {
    reset();
    setImage(null);
    onClose();
  };

  // 📷 IMAGE PICKER
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      setImage(asset.uri);

      setValue("image_url", asset.uri as any); // keep schema consistent
    }
  };

  // ⚡ SHAKE ON ERROR
  const triggerShake = () => {
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  };

  const onSubmit = (data: CreateCategoryInput) => {
    if (errors.name) {
      triggerShake();
      return;
    }

    if (!image) {
      triggerShake();
      Alert.alert("Error", "Please select an image");
      return;
    }

    const segments = image.split("/");
    const name = segments[segments.length - 1] || `category-${Date.now()}.jpg`;
    const ext = name.split(".").pop()?.toLowerCase();
    const type =
      ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";

    createCategory.mutate(
      {
        name: data.name,
        image_url: {
          uri: image,
          name,
          type,
        },
      },
      {
        onSuccess: handleClose,
      },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <Pressable className="flex-1" onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="bg-white dark:bg-zinc-900 rounded-t-3xl px-6 pt-4 pb-10">
            {/* Handle */}
            <View className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full self-center mb-5" />

            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-black dark:text-white">
                New Category
              </Text>

              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* 📷 IMAGE PICKER */}
            <TouchableOpacity
              onPress={pickImage}
              className="w-full h-40 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 items-center justify-center mb-6 overflow-hidden"
            >
              {image ? (
                <Image
                  source={{ uri: image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-gray-500 dark:text-gray-400">
                  Tap to upload image
                </Text>
              )}
            </TouchableOpacity>

            {/* NAME INPUT */}
            <Animated.View style={shakeStyle} className="mb-6">
              <Text className="text-sm font-medium text-black dark:text-white mb-2">
                Category Name
              </Text>

              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={inputRef}
                    className="border border-primary rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-800"
                    placeholder="e.g. Mobile Games"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
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
            </Animated.View>

            {/* SUBMIT */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={createCategory.isPending}
              className={`bg-primary py-4 rounded-xl items-center ${
                createCategory.isPending ? "opacity-70" : ""
              }`}
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
      </View>
    </Modal>
  );
};

export default CreateCategoryForm;
