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
import CONFIG from "@/Constants/config";

const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

const CommunityPassBuy = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [userData, setUserData] = useState<any>(null);
  const [walletInfo, setWalletInfo] = useState<{ balance: number }>();
  const [hasCommunityPass, setHasCommunityPass] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const animatedBottom = useRef(new Animated.Value(insets.bottom)).current;

  const { token, user } = useAuthStore();
  const { completePass } = useGiftingStore();

  // Check if Community pass is already purchased
  useEffect(() => {
    const HasCommunityPass = async () => {
      try {
        const response = await fetch(
          `${BACKEND_API_URL}/user/has-community-access/${id}`,
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
          throw new Error(data.message || "Failed to fetch user creator pass");
        }

        console.log("has Creator pass", data);
        setHasCommunityPass(data.hasCreatorPass);
      } catch (error) {
        console.log(error);
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "An unknown error occurred while following user."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id && token) {
      HasCommunityPass();
    }
  }, []);

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
        console.log("commuity data", data);
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

  // ------------ Transaction -------------------

  const purchasePass = async () => {
    if (!token && !id && hasCommunityPass) {
      console.log("hasCommunityPass", hasCommunityPass);
      return;
    }

    if (hasCommunityPass) {
      console.log("community pass already purchased", hasCommunityPass);
      Alert.alert("You already purchased community pass");
      return;
    }

    if (walletInfo && walletInfo.balance < userData?.community_fee_amount) {
      Alert.alert("You don't have sufficient balance");
      return;
    }

    if (user && user?.id == userData?.founder?._id) {
      Alert.alert("You cannot pay yourself");
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/wallet/transfer/community-fee`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            communityId: id,
            amount: userData?.community_fee_amount,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to provide community pass");
      const data = await response.json();
      console.log("purchase community pass data---------------", data);
      completePass(userData?.community_fee_amount);
      router.back();
    } catch (err) {
      console.log(err);
    }
  };

  const handleProceed = async () => {
    setLoading(true);
    await purchasePass();
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
      <View className="flex-1 justify-between pt-0 px-5">
        {/* Top section */}
        <View className="mt-5">
          <CreatorInfo
            profile={userData?.founder?.profile_photo || CONFIG.DEFAULT_COMMUNITY_PROFILE_PHOTO}
            name={userData?.founder?.name}
            username={userData?.founder?.username}
          />
        </View>

        {/* Middle section */}
        <View className="items-center">
          <View className="flex-row items-center justify-center">
            <Text className="text-4xl text-white">
              ₹ {userData?.community_fee_amount}
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
            bottom: Animated.add(new Animated.Value(50), animatedBottom),
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

export default CommunityPassBuy;
