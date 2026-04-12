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

import { useLogin } from "@/hooks/useAuth";
import { LoginInput, loginSchema } from "@/validations/auth.validate";


const LoginScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [showPassword, setShowPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const login = useLogin();

  const onSubmit = (data: LoginInput) => {
    login.mutate(data);
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
            Login
          </Text>

          {/* Subtitle */}
          <Text className="text-base text-center mb-6 text-gray-500 dark:text-gray-400">
            Please enter your email and password to continue to your account
          </Text>

          {/* Form */}
          <View className="flex-1">
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

            {/* Forgot Password */}
            <View className="items-end mt-1">
              <Link
                href="/(auth)/forgot_password"
                className="text-primary font-semibold text-sm"
              >
                Forgot password?
              </Link>
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={login.isPending}
              className="bg-primary py-4 rounded-xl items-center mt-4"
            >
              {login.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Login
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-sm text-black dark:text-white">
                Don't have an account?{" "}
                <Link
                  href="/(auth)/register"
                  className="text-primary font-semibold"
                >
                  Sign up
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
