import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";

import { useRegister } from "@/hooks/useAuth";
import { registerSchema, RegisterInput } from "@/validations/auth.validate";

const RegisterScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [showPassword, setShowPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const register = useRegister();

  const onSubmit = (data: RegisterInput) => {
    register.mutate(data);
  };

  return (
    <View className="flex-1 bg-white dark:bg-black px-5">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image */}
          <View className="h-[30%] justify-center items-center mb-8">
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 200, height: 200 }}
              contentFit="contain"
            />
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-center mb-4 text-black dark:text-white">
            Create an account
          </Text>

          {/* Subtitle */}
          <Text className="text-base text-center mb-6 text-gray-500 dark:text-gray-400">
            Please fill in the form to create an account
          </Text>

          {/* Form */}
          <View className="flex-1">
            {/* Name */}
            <View className="mb-5">
              <Text className="mb-1 text-sm font-medium text-black dark:text-white">
                Name
              </Text>

              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-primary rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-900"
                    placeholder="Enter your name"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />

              {errors.name && (
                <Text className="text-red-500 mt-2 text-sm">
                  {errors.name.message}
                </Text>
              )}
            </View>

            {/* Email */}
            <View className="mb-5">
              <Text className="mb-1 text-sm font-medium text-black dark:text-white">
                Email
              </Text>

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-primary rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-900"
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />

              {errors.email && (
                <Text className="text-red-500 mt-2 text-sm">
                  {errors.email.message}
                </Text>
              )}
            </View>

            {/* Phone */}
            <View className="mb-5">
              <Text className="mb-1 text-sm font-medium text-black dark:text-white">
                Phone
              </Text>

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-primary rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-900"
                    placeholder="Enter your phone"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="phone-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />

              {errors.phone && (
                <Text className="text-red-500 mt-2 text-sm">
                  {errors.phone.message}
                </Text>
              )}
            </View>

            {/* Password */}
            <View className="mb-5">
              <Text className="mb-1 text-sm font-medium text-black dark:text-white">
                Password
              </Text>

              <View className="flex-row items-center border border-primary rounded-xl bg-white dark:bg-zinc-900">
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 px-4 py-3 text-black dark:text-white"
                      placeholder="Enter your password"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />

                <TouchableOpacity
                  className="px-3 py-3"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={isDark ? "#fff" : "#000"}
                  />
                </TouchableOpacity>
              </View>

              {errors.password && (
                <Text className="text-red-500 mt-2 text-sm">
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={register.isPending}
              className="bg-primary py-4 rounded-xl items-center mt-4"
            >
              {register.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Create an account
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-sm text-black dark:text-white">
                Already have an account?
                <Link href="/(auth)" className="text-primary font-semibold">
                  Login
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;
