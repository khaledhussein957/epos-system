import { useLocalSearchParams, useRouter } from "expo-router";
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
  View,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";

import { useResetPassword } from "@/hooks/useAuth";
import {
  resetPasswordSchema,
  ResetPasswordInput,
} from "@/validations/auth.validate";

const ResetPasswordScreen = () => {
  const router = useRouter();

  const { email, code } = useLocalSearchParams<{
    email: string;
    code: string;
  }>();

  const [showPassword, setShowPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const resetPassword = useResetPassword();

  const onSubmit = (data: ResetPasswordInput) => {
    resetPassword.mutate(
      {
        email,
        code,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: () => {
          router.replace("/(auth)");
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-background px-5">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          {/* TITLE */}
          <Text className="text-3xl font-bold text-center mb-6 text-foreground">
            Reset Password
          </Text>

          {/* NEW PASSWORD */}
          <View className="mb-4">
            <Text className="text-sm mb-1 text-foreground">New Password</Text>

            <View className="flex-row items-center border border-border rounded-xl bg-card">
              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="flex-1 px-4 py-3 text-foreground"
                    placeholder="Enter new password"
                    secureTextEntry={!showPassword}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="px-3"
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {errors.newPassword && (
              <Text className="text-destructive mt-1">
                {errors.newPassword.message}
              </Text>
            )}
          </View>

          {/* CONFIRM PASSWORD */}
          <View className="mb-4">
            <Text className="text-sm mb-1 text-foreground">
              Confirm Password
            </Text>

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="border border-border rounded-xl px-4 py-3 bg-card text-foreground"
                  placeholder="Confirm password"
                  secureTextEntry={!showPassword}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            {errors.confirmPassword && (
              <Text className="text-destructive mt-1">
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={resetPassword.isPending}
            className="bg-primary py-4 rounded-xl items-center mt-4"
          >
            {resetPassword.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-primary-foreground font-semibold">
                Reset Password
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResetPasswordScreen;
