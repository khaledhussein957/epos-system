import React, { useEffect } from "react";
import { View, Pressable, Keyboard, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { height } = Dimensions.get("window");

export const BottomSheet = ({ visible, children, onClose }: any) => {
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 180,
      });

      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(height, {
        damping: 20,
        stiffness: 200,
      });

      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <View className="absolute inset-0 justify-end">
      {/* BACKDROP */}
      <Animated.View
        style={backdropStyle}
        className="absolute inset-0 bg-black/50"
      >
        <Pressable
          className="flex-1"
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        />
      </Animated.View>

      {/* SHEET */}
      <Animated.View
        style={sheetStyle}
        className="bg-white dark:bg-zinc-900 rounded-t-3xl"
      >
        {children}
      </Animated.View>
    </View>
  );
};
