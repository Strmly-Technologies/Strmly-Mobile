import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useAuthStore } from "@/store/useAuthStore";
import CONFIG from "@/Constants/config";

const { height } = Dimensions.get("window");
const API_BASE_URL = CONFIG.API_BASE_URL;

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  options: string[];
  onConfirm?: (selected: string[]) => void;
  targetId: string;
}

export const Drawer = ({
  visible,
  onClose,
  options,
  onConfirm,
  targetId,
}: DrawerProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isReporting, setIsReporting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const translateY = useSharedValue(height);
  const { user, token } = useAuthStore();

  // Animate open/close
  useEffect(() => {
    translateY.value = visible
      ? withTiming(0, { duration: 300 })
      : withTiming(height, { duration: 300 });
  }, [visible]);

  // Gesture for dragging down to close
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 50) {
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const reportCall = async () => {
    try {
      setIsReporting(true);
      setSuccessMessage(null);

      if (!token) throw new Error("User not authenticated");

      const response = await fetch(`${API_BASE_URL}/caution/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetId,
          reason: selectedOptions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Block user failed:", data);
        setSuccessMessage(null);
        return;
      }

      // ✅ show success message
      setSuccessMessage(data.message || "User blocked successfully!");
      setSelectedOptions([]);
      if (onConfirm) {
        setSelectedOptions([]);
        onConfirm(selectedOptions);
      }
    } catch (error) {
      console.error("Error in reportCall:", error);
      setSuccessMessage("Something went wrong. Please try again.");
    } finally {
      setIsReporting(false);
    }
  };

  const handleClose = () => {
      runOnJS(onClose)();
      setSuccessMessage(null);
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={drawerStyle}
        className="absolute bottom-0 left-0 w-full bg-white dark:bg-neutral-900 rounded-t-3xl px-6 py-5 gap-2 shadow-2xl"
      >
        {/* Grab Handle */}
        <View className="self-center w-12 h-1 bg-black dark:bg-white rounded-full mb-5" />

        {/* ✅ If success, show message instead of options */}
        {successMessage ? (
          <View className="items-center py-10">
            <Text className="text-green-600 dark:text-green-400 text-lg font-semibold mb-3 text-center">
              {successMessage}
            </Text>

            <Pressable
              onPress={handleClose}
              className="bg-green-600 dark:bg-green-700 px-8 py-3 rounded-2xl mt-2"
            >
              <Text className="text-white font-semibold">Close</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Selected Options */}
            {selectedOptions.length > 0 && (
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Selected:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row"
                >
                  {selectedOptions.map((option, index) => (
                    <View
                      key={index}
                      className="bg-blue-100 dark:bg-blue-800 px-3 py-1 rounded-full mr-2"
                    >
                      <Text className="text-blue-700 dark:text-blue-200 text-sm">
                        {option}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Title */}
            <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Choose options
            </Text>

            {/* Options List */}
            <ScrollView
              style={{ maxHeight: 220 }}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option, index) => (
                <Pressable
                  key={index}
                  onPress={() => toggleOption(option)}
                  className="flex-row items-center mb-4"
                >
                  <View
                    className={`w-6 h-6 mr-3 rounded-full border border-gray-300 ${
                      selectedOptions.includes(option) && "bg-yellow-600"
                    }`}
                  />
                  <Text className="text-gray-800 dark:text-gray-200 text-base">
                    {option}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Confirm Button */}
            <Pressable
              onPress={reportCall}
              disabled={isReporting || selectedOptions.length === 0}
              className={`py-3 mt-4 mb-10 rounded-2xl items-center bg-white
              }`}
            >
              {!isReporting ? (
                <Text className="text-black font-semibold text-lg">
                  Confirm
                </Text>
              ) : (
                <ActivityIndicator size="small" color="#000" />
              )}
            </Pressable>
          </>
        )}
      </Animated.View>
    </GestureDetector>
  );
};
