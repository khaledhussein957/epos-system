import { useAuthStore } from "@/store/auth.store";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) return <Redirect href={"/(tabs)/index"} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}