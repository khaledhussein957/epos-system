import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SymbolView } from "expo-symbols";

import { useCreateCustomer, useGetCustomers } from "@/hooks/useCustomer";
import type { ICustomer } from "@/types";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (customer: ICustomer) => void;
}

type Mode = "search" | "create";

export const CustomerPicker = ({ visible, onClose, onSelect }: Props) => {
  const [mode, setMode] = useState<Mode>("search");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const { data, isFetching } = useGetCustomers(search);
  const createCustomer = useCreateCustomer();

  const close = () => {
    setMode("search");
    setSearch("");
    setForm({ name: "", email: "", phone: "" });
    onClose();
  };

  const handleCreate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return;
    createCustomer.mutate(form, {
      onSuccess: (customer) => {
        onSelect(customer);
        close();
      },
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <Pressable onPress={close} className="flex-1 bg-black/50" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="bg-white dark:bg-zinc-900 rounded-t-3xl px-6 pt-4 pb-10 max-h-[80%]">
          <View className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full self-center mb-4" />

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-black dark:text-white">
              {mode === "search" ? "Choose customer" : "New customer"}
            </Text>
            <TouchableOpacity
              onPress={close}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 items-center justify-center"
            >
              <SymbolView name="xmark" size={14} tintColor="#6B7280" />
            </TouchableOpacity>
          </View>

          {mode === "search" ? (
            <>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search by name, email, phone…"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 mb-3 text-black dark:text-white bg-white dark:bg-zinc-800"
              />

              <FlatList
                data={data ?? []}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 320 }}
                ListEmptyComponent={
                  isFetching ? (
                    <View className="py-8 items-center">
                      <ActivityIndicator color="#7C3AED" />
                    </View>
                  ) : (
                    <View className="py-8 items-center">
                      <Text className="text-gray-500 dark:text-gray-400">
                        No matches.
                      </Text>
                    </View>
                  )
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      onSelect(item);
                      close();
                    }}
                    className="flex-row items-center py-3 border-b border-gray-100 dark:border-zinc-800"
                  >
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                      <Text className="text-primary font-bold">
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-black dark:text-white">
                        {item.name}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {item.email} · {item.phone}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity
                onPress={() => setMode("create")}
                className="flex-row items-center justify-center bg-gray-100 dark:bg-zinc-800 py-3 rounded-xl mt-3"
              >
                <SymbolView name="plus" size={14} tintColor="#374151" />
                <Text className="ml-2 font-semibold text-black dark:text-white">
                  Add walk-in customer
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <MiniField
                label="Full name"
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                autoCapitalize="words"
              />
              <MiniField
                label="Email"
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <MiniField
                label="Phone"
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                keyboardType="phone-pad"
              />
              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  onPress={() => setMode("search")}
                  className="flex-1 bg-gray-100 dark:bg-zinc-800 py-3 rounded-xl items-center"
                >
                  <Text className="font-semibold text-black dark:text-white">
                    Back
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreate}
                  disabled={createCustomer.isPending}
                  className="flex-1 bg-primary py-3 rounded-xl items-center"
                >
                  {createCustomer.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="font-semibold text-white">Save & pick</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

interface MiniFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "phone-pad";
}

const MiniField = ({
  label,
  value,
  onChangeText,
  autoCapitalize = "sentences",
  keyboardType = "default",
}: MiniFieldProps) => (
  <View className="mb-3">
    <Text className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      className="border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-800"
      placeholderTextColor="#9CA3AF"
    />
  </View>
);
