import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";

import { getProductByBarcode } from "@/hooks/useProduct";
import { useCartStore } from "@/store/cart.store";
import { notify } from "@/lib/notify";

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [lookingUp, setLookingUp] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const cooldownRef = useRef<number | null>(null);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const handleScan = useCallback(
    async (result: BarcodeScanningResult) => {
      const code = result.data?.trim();
      if (!code || lookingUp) return;
      if (code === lastCode && cooldownRef.current) return;

      setLookingUp(true);
      setLastCode(code);
      cooldownRef.current = Date.now();

      try {
        const product = await getProductByBarcode(code);
        addItem(product);
        notify.success(product.name, "Added to cart");
        router.back();
      } catch (error: any) {
        const message =
          error?.response?.data?.message ?? "No product matches that code.";
        notify.error("Scan failed", message);
        setTimeout(() => {
          setLastCode(null);
          cooldownRef.current = null;
        }, 1500);
      } finally {
        setLookingUp(false);
      }
    },
    [addItem, lastCode, lookingUp, router],
  );

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="white" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black px-8">
        <SymbolView name="camera.fill" size={48} tintColor="#7C3AED" />
        <Text className="text-white text-lg font-bold mt-4 text-center">
          Camera access needed
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          Grant permission to scan product barcodes.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-primary px-6 py-3 rounded-xl mt-6"
        >
          <Text className="text-white font-semibold">Grant access</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} className="mt-3">
          <Text className="text-gray-400">Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={lookingUp ? undefined : handleScan}
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code128",
            "code39",
            "code93",
            "codabar",
            "itf14",
            "qr",
            "pdf417",
          ],
        }}
      />

      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
          >
            <SymbolView name="xmark" size={16} tintColor="white" />
          </TouchableOpacity>
          <Text className="text-white font-semibold">Scan barcode</Text>
          <View className="w-10" />
        </View>

        <View className="flex-1 items-center justify-center">
          <View style={styles.reticle} />
          {lookingUp && (
            <View className="mt-6 bg-black/60 px-4 py-2 rounded-full flex-row items-center">
              <ActivityIndicator color="white" />
              <Text className="text-white ml-2">Looking up…</Text>
            </View>
          )}
        </View>

        <View className="px-6 pb-8">
          <Text className="text-white/80 text-center">
            Point the camera at a product barcode.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  reticle: {
    width: 260,
    height: 160,
    borderColor: "#7C3AED",
    borderWidth: 3,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
});
