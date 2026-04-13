import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "@/store/auth.store";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerStyle={{ padding: 24 }}
    >
      {/* Avatar */}
      <View className="items-center mb-8 mt-8">
        <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-4">
          <Text className="text-white text-4xl font-bold">
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text className="text-2xl font-bold text-black dark:text-white">
          {user?.name ?? "User"}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {user?.email ?? ""}
        </Text>
      </View>

      {/* Info */}
      <View className="bg-gray-100 dark:bg-zinc-900 rounded-2xl p-4 mb-6 gap-4">
        <View className="flex-row items-center gap-3">
          <Ionicons name="mail-outline" size={20} color="#6B7280" />
          <Text className="text-black dark:text-white flex-1">{user?.email ?? "—"}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Ionicons name="call-outline" size={20} color="#6B7280" />
          <Text className="text-black dark:text-white flex-1">{user?.phone ?? "—"}</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 py-4 rounded-xl items-center flex-row justify-center gap-2"
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text className="text-white font-semibold text-base">Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
