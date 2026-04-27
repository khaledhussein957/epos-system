import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetUsers, useDeleteUser, useToggleBlockUser } from "@/hooks/useUser";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";

export default function AdminUsers() {
  const getUsers = useGetUsers();
  const deleteUser = useDeleteUser();
  const toggleBlock = useToggleBlockUser();

  useEffect(() => {
    getUsers.mutate();
  }, []);

  const handleDelete = (targetUserId: number) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteUser.mutate({ targetUserId, password: "" })
        }
      ]
    );
  };

  const handleToggleBlock = (targetUserId: number) => {
    toggleBlock.mutate({ targetUserId });
  };

  if (getUsers.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold text-black dark:text-white mb-6">
          User Management
        </Text>

        <FlatList
          data={getUsers.data}
          keyExtractor={(item) => item.id.toString()}
          onRefresh={() => getUsers.mutate()}
          refreshing={getUsers.isPending}
          renderItem={({ item }) => (
            <View className="bg-white dark:bg-zinc-800 p-4 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-zinc-700 flex-row items-center">
              {item.profilePicture ? (
                <Image
                  source={{ uri: item.profilePicture }}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-700 items-center justify-center">
                  <Text className="text-gray-500 font-bold">
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              
              <View className="flex-1 ml-4">
                <Text className="text-lg font-bold text-black dark:text-white">
                  {item.name}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs">
                  {item.email}
                </Text>
                <View className="flex-row mt-1">
                   <Text className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.role.toUpperCase()}
                  </Text>
                  {item.isBlock && (
                    <Text className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      BLOCKED
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row">
                <TouchableOpacity 
                  className="p-2 mr-1"
                  onPress={() => handleToggleBlock(item.id)}
                >
                  <SymbolView name={item.isBlock ? "lock.open.fill" : "lock.fill"} size={18} tintColor={item.isBlock ? "#10B981" : "#F59E0B"} />
                </TouchableOpacity>
                <TouchableOpacity 
                  className="p-2"
                  onPress={() => handleDelete(item.id)}
                >
                  <SymbolView name="trash.fill" size={18} tintColor="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-gray-500 dark:text-gray-400">
                No users found.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
