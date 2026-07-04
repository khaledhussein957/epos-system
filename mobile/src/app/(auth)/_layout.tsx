import { useAuthStore } from "@/store/auth.store";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    const role = user?.role;
    if (role === "admin" || role === "cashier") {
      return <Redirect href="/(admin-tabs)" />;
    }
    return <Redirect href="/(user-tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
