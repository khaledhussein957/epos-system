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
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";

import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomer";
import {
  createCustomerSchema,
  type CreateCustomerInput,
} from "@/validations/customer.validate";
import type { ICustomer } from "@/types";

type Props =
  | { visible: boolean; onClose: () => void; mode: "create"; customer?: never }
  | {
      visible: boolean;
      onClose: () => void;
      mode: "update";
      customer: ICustomer | null;
    };

export const CustomerForm = (props: Props) => {
  const { visible, onClose, mode } = props;
  const customer = mode === "update" ? props.customer : null;

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const mutation = mode === "create" ? createCustomer : updateCustomer;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  useEffect(() => {
    if (mode === "update" && customer) {
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      });
    } else if (mode === "create") {
      reset({ name: "", email: "", phone: "" });
    }
  }, [mode, customer, reset, visible]);

  const handleClose = () => {
    reset({ name: "", email: "", phone: "" });
    onClose();
  };

  const onSubmit = (data: CreateCustomerInput) => {
    if (mode === "create") {
      createCustomer.mutate(data, { onSuccess: handleClose });
      return;
    }
    if (!customer) return;
    updateCustomer.mutate({ id: customer.id, ...data }, { onSuccess: handleClose });
  };

  const title = mode === "create" ? "New Customer" : "Edit Customer";
  const cta = mode === "create" ? "Create" : "Save changes";

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
              {title}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Field
            control={control}
            name="name"
            label="Full name"
            placeholder="Jane Doe"
            autoCapitalize="words"
            error={errors.name?.message}
          />
          <Field
            control={control}
            name="email"
            label="Email"
            placeholder="jane@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email?.message}
          />
          <Field
            control={control}
            name="phone"
            label="Phone"
            placeholder="+252…"
            keyboardType="phone-pad"
            error={errors.phone?.message}
          />

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={mutation.isPending}
            className="bg-primary py-4 rounded-xl items-center mt-2"
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">{cta}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

interface FieldProps {
  control: ReturnType<typeof useForm<CreateCustomerInput>>["control"];
  name: keyof CreateCustomerInput;
  label: string;
  placeholder: string;
  error?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "phone-pad";
}

const Field = ({
  control,
  name,
  label,
  placeholder,
  error,
  autoCapitalize = "sentences",
  keyboardType = "default",
}: FieldProps) => (
  <View className="mb-4">
    <Text className="text-sm font-medium text-black dark:text-white mb-2">
      {label}
    </Text>
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          value={value}
          onBlur={onBlur}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          className="border border-primary rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-800"
        />
      )}
    />
    {error ? <Text className="text-red-500 mt-1 text-sm">{error}</Text> : null}
  </View>
);
