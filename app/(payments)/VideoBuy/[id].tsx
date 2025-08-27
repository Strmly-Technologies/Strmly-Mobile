import ThemedView from "@/components/ThemedView";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Keyboard,
  Pressable,
  Animated,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
import CreatorInfo from "../Video/_components/CreatorInfo";
import { useRoute } from "@react-navigation/native";

import { useGiftingStore } from "@/store/useGiftingStore";

const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

const VideoBuy = () => {
  const route = useRoute();
    const { id } = route.params as { id: string };
  // const id = "68af09b07e3b646508d07331";
  const [userData, setUserData] = useState<any>(null);
  const [walletInfo, setWalletInfo] = useState<{ balance: number }>();
  const [hasVideoAccess, setHasVideoAccess] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const animatedBottom = useRef(new Animated.Value(insets.bottom)).current;

  const { token, user } = useAuthStore();
  const { completeVideoAccess } = useGiftingStore();

  // Check if Creator pass is already purchased
  useEffect(() => {
    const hasCreatorPass = async () => {
      try {
        const response = await fetch(
          `${BACKEND_API_URL}/user/has-user-access/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch video access");
        }

        console.log("has Video pass", data.data);
        setHasVideoAccess(data.data.hasUserAccess);
      } catch (error) {
        console.log(error);
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "An unknown error occurred while checking video access."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id && token) {
      hasCreatorPass();
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${BACKEND_API_URL}/videos/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user profile");
        }

        setUserData(data.video);
        console.log("Pubic User data", data.video);
      } catch (error) {
        console.log(error);
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "An unknown error occurred while fetching user data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token && id) {
      fetchUserData();
    }
  }, [token, id]);

  // ------------ Transaction -------------------

  const purchaseVideo = async () => {
    if (!token && !id && hasVideoAccess) {
      console.log("hasVideoAccess", hasVideoAccess);
      return;
    }

    if (hasVideoAccess) {
      console.log("Video access already purchased", hasVideoAccess);
      Alert.alert("You already purchased Video access");
      return;
    }

    if (walletInfo && walletInfo.balance < userData?.access.price) {
      Alert.alert("You don't have sufficient balance");
      return;
    }

    if (user && user?.id === userData?.created_by?._id) {
      Alert.alert("You cannot pay yourself");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_API_URL}/videos/${id}/purchase`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: userData?.access.price }),
      });

      if (!response.ok) throw new Error("Failed to provide Video access");
      const data = await response.json();
      console.log("purchase Video access data---------------", data);
      completeVideoAccess(userData?.access.price);
      router.back();
    } catch (err) {
      console.log(err);
    }
  };

  const handleProceed = async () => {
    setLoading(true);
    await purchaseVideo();
    setLoading(false);
    Keyboard.dismiss();
  };

  // ------ Wallet Status API --------

  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${BACKEND_API_URL}/wallet/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch wallet info");
        const data = await response.json();
        console.log("dWallet data---------------", data.wallet);
        setWalletInfo(data.wallet);
      } catch (err) {
        console.log(err);
      }
    };

    if (token) {
      fetchWalletInfo();
    }
  }, [token]);

  return (
    <ThemedView className="flex-1 bg-black">
      <View className="flex-1 justify-between pt-10 px-5">
        {/* Top section */}
        <View className="mt-5">
          <CreatorInfo
            profile={userData?.created_by?.profile_photo}
            name={userData?.created_by?.name}
            username={userData?.created_by?.username}
          />
        </View>

        {/* Middle section */}
        <View className="items-center">
          <View className="flex-row items-center justify-center">
            <Text className="text-4xl text-white">
              ₹ {userData?.access.price}
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="mt-4">
              <Text className="text-red-400 text-sm text-center">{error}</Text>
            </View>
          )}
        </View>

        <View></View>
        <View></View>
        {/* Animated Bottom section */}
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: Animated.add(new Animated.Value(80), animatedBottom),
            paddingBottom: insets.bottom,
          }}
          className="gap-2 justify-end"
        >
          <Pressable
            disabled={loading}
            onPress={handleProceed}
            className={`p-4 rounded-lg items-center justify-center ${
              loading ? "bg-gray-600" : "bg-[#008A3C]"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Proceed
              </Text>
            )}
          </Pressable>

          <View className="items-center justify-center mt-1">
            <Text className="text-white text-sm">
              Total balance ₹ {walletInfo?.balance}
            </Text>
          </View>
        </Animated.View>
      </View>
    </ThemedView>
  );
};

export default VideoBuy;
