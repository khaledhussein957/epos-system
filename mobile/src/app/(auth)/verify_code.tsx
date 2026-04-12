import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRecoveryPassword } from "@/hooks/useAuth";
import {
  resendCode,
  ResendCodeInput,
  forgotPasswordSchema,
  ForgotPasswordInput,
} from "@/validations/auth.validate";

const VerifyCodeScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendCodeInput>({
    resolver: zodResolver(resendCode),
    defaultValues: {
      code: "",
    },
  });

  const resetPassword = useRecoveryPassword();

  const onResendCode = (data: ForgotPasswordInput) => {
    resetPassword.mutate({ email });
  };

  const onSubmit = (data: ResendCodeInput) => {
    router.push({
      pathname: "/(auth)/reset_password",
      params: {
        email,
        code: data.code,
      },
    });
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
          {/* IMAGE */}
          <View className="items-center mb-8">
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 180, height: 180 }}
              contentFit="contain"
            />
          </View>

          {/* TITLE */}
          <Text className="text-3xl font-bold text-center mb-4 text-foreground">
            Verify Code
          </Text>

          <Text className="text-center text-muted-foreground mb-6">
            Enter the code sent to {email}
          </Text>

          {/* INPUT */}
          <View className="mb-5">
            <Controller
              control={control}
              name="code"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="border border-border rounded-xl px-4 py-4 text-center text-xl tracking-widest bg-card text-foreground"
                  placeholder="000000"
                  keyboardType="number-pad"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            {errors.code && (
              <Text className="text-destructive mt-2 text-sm">
                {errors.code.message}
              </Text>
            )}
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            onPress={handleSubmit(onResendCode)}
            className="bg-primary py-4 rounded-xl items-center"
          >
            <Text className="text-primary-foreground font-semibold">
              Resend Code
            </Text>
          </TouchableOpacity>

          {/* BUTTON */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="bg-primary py-4 rounded-xl items-center"
          >
            <Text className="text-primary-foreground font-semibold">
              Continue
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VerifyCodeScreen;
