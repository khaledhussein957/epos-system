import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useAuthStore } from "@/store/auth.store";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <ScrollView className="flex-1 px-4">
        <View className="items-center py-8">
          <View className="relative">
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                className="w-24 h-24 rounded-full border-2 border-primary"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
                <Text className="text-white text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity className="absolute bottom-0 right-0 bg-white dark:bg-zinc-800 p-2 rounded-full shadow-md border border-gray-100 dark:border-zinc-700">
              <SymbolView name="camera.fill" size={16} tintColor="#7C3AED" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-xl font-bold text-black dark:text-white mt-4">
            {user?.name}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400">
            {user?.email}
          </Text>
        </View>

        <View className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700 mb-6">
          <ProfileOption 
            icon="person.fill" 
            label="Update Profile" 
            onPress={() => {}} 
          />
          <ProfileOption 
            icon="lock.fill" 
            label="Change Password" 
            onPress={() => {}} 
          />
          <ProfileOption 
            icon="bell.fill" 
            label="Notifications" 
            onPress={() => {}} 
          />
          <ProfileOption 
            icon="shield.fill" 
            label="Privacy Policy" 
            onPress={() => {}} 
          />
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl flex-row items-center justify-center border border-red-100 dark:border-red-900/30"
        >
          <SymbolView name="arrow.right.square.fill" size={20} tintColor="#EF4444" />
          <Text className="text-red-500 font-bold ml-2">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileOption({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center justify-between py-4 border-b border-gray-50 dark:border-zinc-700 last:border-0"
    >
      <View className="flex-row items-center">
        <SymbolView name={icon} size={20} tintColor="#6B7280" />
        <Text className="text-black dark:text-white font-medium ml-3">{label}</Text>
      </View>
      <SymbolView name="chevron.right" size={16} tintColor="#D1D5DB" />
    </TouchableOpacity>
  );
}
