import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, Dimensions } from "react-native";
import {
  X,
  Unlock,
  Calendar,
  Ban,
  Heart,
  Paperclip,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { useAuthStore } from "@/store/useAuthStore";
import { useGiftingStore } from "@/store/useGiftingStore";
import Constants from "expo-constants";
import ThemedView from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("screen");

const CommunityAccessDemo = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const route = useRoute();
  const { id } = route.params as { id: string };
  const { token } = useAuthStore();
  const { initiateCommunityPass } = useGiftingStore();

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  nextMonth.setDate(today.getDate() + 1); // Next day of same date next month

  const formatDate = (date: Date) =>
    `${date.getDate()} ${date.toLocaleString("default", { month: "long" })}`;

  const validFrom = formatDate(today);
  const validTo = formatDate(nextMonth);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${BACKEND_API_URL}/community/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch community profile");
        }

        setUserData(data);
      } catch (error) {
        console.log(error);
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "An unknown error occurred while fetching community data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token && id) {
      fetchCommunityData();
    }
  }, [id, token]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={['top']}>
      <ThemedView style={{ flex: 1 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 pt-10">
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color="white" />
          </TouchableOpacity>
          <View className="w-6" />
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-center px-6">
          {/* Paperclip Icon */}
          <View className="mb-8">
            <View className="w-20 h-20 rounded-2xl items-center justify-center">
              <Paperclip size={75} color="white" />
            </View>
          </View>

          {/* Title */}
          <Text className="text-white text-2xl font-bold mb-2">
            Community Access
          </Text>

          {/* Features Card */}
          <View className="w-full max-w-md rounded-2xl mb-8 overflow-hidden">
            {/* Gradient Border */}
            <LinearGradient
              colors={["#4400FFA6", "#FFFFFF", "#FF00004D", "#FFFFFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-[2px] rounded-2xl"
            >
              {/* Inner Card with Black to Grey Gradient */}
              <LinearGradient
                colors={["#000000", "#0a0a0a", "#1a1a1a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl p-8"
              >
                {/* Feature 1 */}
                <View className="flex-row items-start mb-8">
                  <View className="mr-6 mt-1">
                    <Unlock size={28} color="#10B981" />
                  </View>
                  <Text className="text-white text-sm flex-1 leading-6">
                    Join a paid community to upload your videos
                  </Text>
                </View>

                {/* Feature 2 */}
                <View className="flex-row items-start mb-8">
                  <View className="mr-6 mt-1">
                    <Calendar size={28} color="white" />
                  </View>
                  <Text className="text-white text-sm flex-1 leading-6">
                    Valid from {validFrom} to {validTo}
                  </Text>
                </View>

                {/* Feature 3 */}
                <View className="flex-row items-start mb-8">
                  <View className="mr-6 mt-1">
                    <Ban size={28} color="white" />
                  </View>
                  <Text className="text-white text-sm flex-1 leading-6">
                    Instantly reach all followers of the community
                  </Text>
                </View>

                {/* Feature 4 */}
                <View className="flex-row items-start">
                  <View className="mr-6 mt-1">
                    <Heart size={28} color="#EF4444" fill="#EF4444" />
                  </View>
                  <Text className="text-white text-sm flex-1 leading-6">
                    Locked price — no increase for existing members
                  </Text>
                </View>
              </LinearGradient>
            </LinearGradient>
          </View>

          {/* Join Button */}
          {!isLoading && (
            <View className="animate-bounce">
              <LinearGradient
                colors={["#000000", "#0a0a0a", "#1a1a1a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-full"
              >
                <TouchableOpacity
                  disabled={isLoading}
                  onPress={() => {
                    initiateCommunityPass(userData?.founder);
                    router.replace(`/(payments)/CommunityPassBuy/${id}`);
                  }}
                  className={`px-8 py-4 rounded-full`}
                >
                  <Text className="text-white text-lg font-medium">
                    Join at ₹{userData?.community_fee_amount}/month
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

export default CommunityAccessDemo;
