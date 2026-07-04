import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";

import {
  useDeleteCustomer,
  useGetCustomers,
} from "@/hooks/useCustomer";
import { CustomerForm } from "@/components/customer_form";
import { CustomerDetailSheet } from "@/components/customer_detail_sheet";
import { useAuthStore } from "@/store/auth.store";
import type { ICustomer } from "@/types";

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ICustomer | null>(null);
  const [viewing, setViewing] = useState<ICustomer | null>(null);

  const isAdmin = useAuthStore((s) => s.user?.role === "admin");

  const {
    data: customers,
    isLoading,
    refetch,
    isFetching,
  } = useGetCustomers(search);
  const deleteCustomer = useDeleteCustomer();

  const confirmDelete = (customer: ICustomer) => {
    Alert.alert(
      "Delete customer",
      `Delete ${customer.name}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCustomer.mutate(customer.id),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-black dark:text-white">
          Customers
        </Text>
      </View>

      <View className="px-4 pb-2">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, email, or phone…"
          placeholderTextColor="#9CA3AF"
          className="border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-800"
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={customers ?? []}
          keyExtractor={(item) => item.id}
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setViewing(item)}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800 flex-row items-center"
            >
              <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Text className="text-primary font-bold">
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className="font-semibold text-black dark:text-white"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text
                  className="text-xs text-gray-500 dark:text-gray-400"
                  numberOfLines={1}
                >
                  {item.email} · {item.phone}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditing(item)}
                className="p-2"
                accessibilityLabel={`Edit ${item.name}`}
              >
                <SymbolView name="pencil" size={16} tintColor="#3B82F6" />
              </TouchableOpacity>
              {isAdmin && (
                <TouchableOpacity
                  onPress={() => confirmDelete(item)}
                  className="p-2"
                  accessibilityLabel={`Delete ${item.name}`}
                >
                  <SymbolView name="trash.fill" size={16} tintColor="#EF4444" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center pt-16">
              <Text className="text-gray-500 dark:text-gray-400">
                {search ? "No matches." : "No customers yet."}
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        onPress={() => setCreating(true)}
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <SymbolView name="plus" size={24} tintColor="white" />
      </TouchableOpacity>

      <CustomerForm
        mode="create"
        visible={creating}
        onClose={() => setCreating(false)}
      />
      <CustomerForm
        mode="update"
        visible={!!editing}
        customer={editing}
        onClose={() => setEditing(null)}
      />
      <CustomerDetailSheet
        customer={viewing}
        onClose={() => setViewing(null)}
      />
    </SafeAreaView>
  );
}
