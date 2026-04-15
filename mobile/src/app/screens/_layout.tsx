import { useAuthStore } from "../../store/auth.store";
import { Redirect, Stack } from "expo-router";

export default function ScreensLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Redirect href="/(auth)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
