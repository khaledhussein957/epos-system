import { useAuthStore } from "@/store/auth.store";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return (
      <Redirect href={user?.role === "admin" ? "/(admin-tabs)" : "/(user-tabs)"} />
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
