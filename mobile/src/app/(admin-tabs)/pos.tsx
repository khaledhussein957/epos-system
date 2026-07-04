import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Pressable,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";

import { useGetProducts } from "@/hooks/useProduct";
import { useCreateOrder } from "@/hooks/useOrder";
import { selectCartTotals, useCartStore } from "@/store/cart.store";
import { notify } from "@/lib/notify";
import { CustomerPicker } from "@/components/customer_picker";
import type { PaymentMethod } from "@/types/order.types";
import type { ICustomer, IProduct } from "@/types";

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: "cash", label: "Cash", icon: "banknote.fill" },
  { key: "card", label: "Card", icon: "creditcard.fill" },
  { key: "mobile", label: "Mobile", icon: "iphone" },
  { key: "bank", label: "Bank", icon: "building.columns.fill" },
];

export default function PosScreen() {
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentAccount, setPaymentAccount] = useState("");
  const [discountInput, setDiscountInput] = useState("");
  const [taxInput, setTaxInput] = useState("");
  const [customer, setCustomer] = useState<ICustomer | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [receipt, setReceipt] = useState<{ id: string; url?: string } | null>(
    null,
  );

  const router = useRouter();
  const { data: products, isLoading, refetch, isFetching } = useGetProducts();
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const createOrder = useCreateOrder();

  const { subtotal, itemCount } = useMemo(
    () => selectCartTotals(items),
    [items],
  );

  const discount = Math.max(Number(discountInput) || 0, 0);
  const tax = Math.max(Number(taxInput) || 0, 0);
  const total = Math.max(subtotal - discount + tax, 0);
  const discountTooLarge = discount > subtotal;

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    if (!q) return products.filter((p) => p.is_active);
    return products.filter(
      (p) => p.is_active && p.name.toLowerCase().includes(q),
    );
  }, [products, search]);

  const needsAccount = paymentMethod === "mobile" || paymentMethod === "bank";

  const handleCheckout = async () => {
    if (items.length === 0) {
      notify.error("Cart is empty");
      return;
    }
    if (needsAccount && !paymentAccount.trim()) {
      notify.error("Payment account required for mobile / bank");
      return;
    }
    if (discountTooLarge) {
      notify.error("Discount cannot exceed subtotal");
      return;
    }

    try {
      const result = await createOrder.mutateAsync({
        payment_method: paymentMethod,
        payment_account: needsAccount ? paymentAccount.trim() : undefined,
        discount: discount > 0 ? discount : undefined,
        tax: tax > 0 ? tax : undefined,
        customer_id: customer?.id,
        items: items.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
        })),
      });

      setReceipt({ id: result.order.id?.toString() ?? "", url: result.receiptUrl });
      clearCart();
      setPaymentAccount("");
      setDiscountInput("");
      setTaxInput("");
      setCustomer(null);
    } catch {
      // toast already fired by hook
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <View className="px-4 py-3 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-black dark:text-white">
          Point of Sale
        </Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text className="text-red-500 font-medium">Clear cart</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="px-4 pb-3 flex-row items-center gap-2">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products by name…"
          placeholderTextColor="#9CA3AF"
          className="flex-1 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-zinc-800"
        />
        <TouchableOpacity
          onPress={() => router.push("/screens/scanner")}
          className="w-12 h-12 rounded-xl bg-primary items-center justify-center"
          accessibilityLabel="Scan barcode"
        >
          <SymbolView name="barcode.viewfinder" size={22} tintColor="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 260, gap: 12 }}
          renderItem={({ item }) => (
            <ProductTile product={item} onAdd={() => addItem(item)} />
          )}
          ListEmptyComponent={
            <View className="pt-10 items-center">
              <Text className="text-gray-500 dark:text-gray-400">
                No products match.
              </Text>
            </View>
          }
        />
      )}

      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 px-4 pt-3 pb-6">
        {items.length > 0 && (
          <View className="mb-2 max-h-40">
            <FlatList
              data={items}
              keyExtractor={(item) => item.product.id}
              renderItem={({ item }) => (
                <View className="flex-row items-center py-1">
                  <Text
                    className="flex-1 text-black dark:text-white"
                    numberOfLines={1}
                  >
                    {item.product.name}
                  </Text>
                  <QtyStepper
                    quantity={item.quantity}
                    onChange={(q) => updateQuantity(item.product.id, q)}
                  />
                  <Text className="w-20 text-right text-black dark:text-white font-medium">
                    ${(Number(item.product.price) * item.quantity).toFixed(2)}
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          className="flex-row items-center bg-gray-100 dark:bg-zinc-800 rounded-xl px-3 py-2 mb-3"
        >
          <SymbolView
            name="person.crop.circle"
            size={16}
            tintColor="#6B7280"
          />
          <View className="flex-1 ml-2">
            {customer ? (
              <>
                <Text
                  className="text-sm font-semibold text-black dark:text-white"
                  numberOfLines={1}
                >
                  {customer.name}
                </Text>
                <Text
                  className="text-[10px] text-gray-500 dark:text-gray-400"
                  numberOfLines={1}
                >
                  {customer.email}
                </Text>
              </>
            ) : (
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                Walk-in customer · tap to select
              </Text>
            )}
          </View>
          {customer && (
            <TouchableOpacity onPress={() => setCustomer(null)} className="p-1">
              <SymbolView name="xmark" size={12} tintColor="#9CA3AF" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <View className="flex-row gap-2 mb-3">
          {PAYMENT_METHODS.map((m) => {
            const selected = m.key === paymentMethod;
            return (
              <TouchableOpacity
                key={m.key}
                onPress={() => setPaymentMethod(m.key)}
                className={`flex-1 flex-row items-center justify-center py-2 rounded-xl border ${
                  selected
                    ? "bg-primary border-primary"
                    : "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                }`}
              >
                <SymbolView
                  name={m.icon as never}
                  size={14}
                  tintColor={selected ? "white" : "#6B7280"}
                />
                <Text
                  className={`ml-1 text-xs font-semibold ${selected ? "text-white" : "text-black dark:text-white"}`}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {needsAccount && (
          <TextInput
            value={paymentAccount}
            onChangeText={setPaymentAccount}
            placeholder={`${paymentMethod === "mobile" ? "Phone" : "Account"} number`}
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            className="border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 mb-3 text-black dark:text-white bg-white dark:bg-zinc-800"
          />
        )}

        <View className="flex-row gap-2 mb-3">
          <View className="flex-1">
            <Text className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
              Discount
            </Text>
            <TextInput
              value={discountInput}
              onChangeText={setDiscountInput}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              className={`border rounded-xl px-3 py-2 text-black dark:text-white bg-white dark:bg-zinc-800 ${
                discountTooLarge
                  ? "border-red-500"
                  : "border-gray-200 dark:border-zinc-700"
              }`}
            />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
              Tax
            </Text>
            <TextInput
              value={taxInput}
              onChangeText={setTaxInput}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              className="border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-black dark:text-white bg-white dark:bg-zinc-800"
            />
          </View>
        </View>

        {(discount > 0 || tax > 0) && (
          <View className="mb-3 gap-0.5">
            <View className="flex-row justify-between">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Subtotal
              </Text>
              <Text className="text-xs text-black dark:text-white">
                ${subtotal.toFixed(2)}
              </Text>
            </View>
            {discount > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Discount
                </Text>
                <Text className="text-xs text-red-500">
                  −${discount.toFixed(2)}
                </Text>
              </View>
            )}
            {tax > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Tax
                </Text>
                <Text className="text-xs text-black dark:text-white">
                  ${tax.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}

        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </Text>
            <Text className="text-xl font-bold text-black dark:text-white">
              ${total.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCheckout}
            disabled={
              createOrder.isPending || items.length === 0 || discountTooLarge
            }
            className={`px-6 py-3 rounded-xl ${
              createOrder.isPending || items.length === 0 || discountTooLarge
                ? "bg-gray-300 dark:bg-zinc-700"
                : "bg-primary"
            }`}
          >
            {createOrder.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">Charge</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
      <CustomerPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={setCustomer}
      />
    </SafeAreaView>
  );
}

function ProductTile({
  product,
  onAdd,
}: {
  product: IProduct;
  onAdd: () => void;
}) {
  const outOfStock = product.stock <= 0;
  return (
    <TouchableOpacity
      onPress={onAdd}
      disabled={outOfStock}
      className={`flex-1 bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-700 ${
        outOfStock ? "opacity-50" : ""
      }`}
    >
      <View className="w-full h-24 bg-gray-100 dark:bg-zinc-900">
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <SymbolView name="cube.box" size={28} tintColor="#9CA3AF" />
          </View>
        )}
      </View>
      <View className="p-2">
        <Text
          className="text-sm font-semibold text-black dark:text-white"
          numberOfLines={1}
        >
          {product.name}
        </Text>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-primary font-bold">
            ${Number(product.price).toFixed(2)}
          </Text>
          <Text className="text-[10px] text-gray-500 dark:text-gray-400">
            {outOfStock ? "Out" : `${product.stock} left`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function QtyStepper({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (q: number) => void;
}) {
  return (
    <View className="flex-row items-center mx-2">
      <TouchableOpacity
        onPress={() => onChange(quantity - 1)}
        className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-zinc-800 items-center justify-center"
      >
        <SymbolView name="minus" size={12} tintColor="#374151" />
      </TouchableOpacity>
      <Text className="w-8 text-center text-black dark:text-white font-semibold">
        {quantity}
      </Text>
      <TouchableOpacity
        onPress={() => onChange(quantity + 1)}
        className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-zinc-800 items-center justify-center"
      >
        <SymbolView name="plus" size={12} tintColor="#374151" />
      </TouchableOpacity>
    </View>
  );
}

function ReceiptModal({
  receipt,
  onClose,
}: {
  receipt: { id: string; url?: string } | null;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={!!receipt}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/50 items-center justify-center px-6"
      >
        <View className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-6 items-center">
          <View className="w-14 h-14 rounded-full bg-green-100 items-center justify-center mb-3">
            <SymbolView
              name="checkmark.circle.fill"
              size={40}
              tintColor="#10B981"
            />
          </View>
          <Text className="text-lg font-bold text-black dark:text-white">
            Sale complete
          </Text>
          {receipt?.id ? (
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Order #{receipt.id.slice(0, 8)}
            </Text>
          ) : null}
          <View className="flex-row gap-2 mt-5 w-full">
            {receipt?.url ? (
              <TouchableOpacity
                onPress={() => receipt.url && Linking.openURL(receipt.url)}
                className="flex-1 bg-primary py-3 rounded-xl items-center"
              >
                <Text className="text-white font-semibold">View receipt</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-100 dark:bg-zinc-800 py-3 rounded-xl items-center"
            >
              <Text className="text-black dark:text-white font-semibold">
                Next sale
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
