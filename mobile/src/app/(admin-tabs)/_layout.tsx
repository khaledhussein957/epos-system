import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useAuthStore } from "../../store/auth.store";
import { Redirect } from "expo-router";

export default function AdminTabLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Redirect href="/(auth)" />;

  const isAdmin = user?.role === "admin";
  const isCashier = user?.role === "cashier";

  if (!isAdmin && !isCashier) return <Redirect href="/(user-tabs)" />;

  const adminOnly = isAdmin ? undefined : null;

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
          title: "Dashboard",
          href: adminOnly,
          tabBarIcon: ({ color }) => (
            <SymbolView name="chart.bar.fill" size={24} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          title: "POS",
          tabBarIcon: ({ color }) => (
            <SymbolView name="cart.badge.plus" size={24} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          href: adminOnly,
          tabBarIcon: ({ color }) => (
            <SymbolView name="square.grid.2x2.fill" size={24} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          href: adminOnly,
          tabBarIcon: ({ color }) => (
            <SymbolView name="list.bullet" size={24} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <SymbolView name="cart.fill" size={24} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          href: adminOnly,
          tabBarIcon: ({ color }) => (
            <SymbolView name="person.2.fill" size={24} tintColor={color} />
          ),
        }}
      />
    </Tabs>
  );
}
