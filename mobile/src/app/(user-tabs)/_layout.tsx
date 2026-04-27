import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useAuthStore } from "../../store/auth.store";
import { Redirect } from "expo-router";

export default function UserTabLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Redirect href="/(auth)" />;
  
  // If user is admin, they shouldn't be in user-tabs (optional check)
  // if (user?.role === "admin") return <Redirect href="/(admin-tabs)" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#7C3AED",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <SymbolView name="house.fill" size={24} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <SymbolView name="magnifyingglass" size={24} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <SymbolView name="bag.fill" size={24} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <SymbolView name="person.fill" size={24} tintColor={color} />
          ),
        }}
      />
    </Tabs>
  );
}
