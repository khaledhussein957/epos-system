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

import { useRecoveryPassword } from "@/hooks/useAuth";
import {
  forgotPasswordSchema,
  ForgotPasswordInput,
} from "@/validations/auth.validate";

const ForgotPasswordScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPassword = useRecoveryPassword();

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPassword.mutate(data);
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
            Forgot Password
          </Text>

          {/* Subtitle */}
          <Text className="text-base text-center mb-6 text-gray-500 dark:text-gray-400">
            Enter your email address and we will send you a code to reset your
            password
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

            {/* Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={forgotPassword.isPending}
              className="bg-primary py-4 rounded-xl items-center mt-4"
            >
              {forgotPassword.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Reset Password
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-sm text-black dark:text-white">
                Remember your password?
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

export default ForgotPasswordScreen;
