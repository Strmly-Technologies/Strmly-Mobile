import ThemedView from "@/components/ThemedView";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Animated,
  EmitterSubscription,
  KeyboardEvent,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
import CreatorInfo from "../Video/_components/CreatorInfo";
import { useRoute } from "@react-navigation/native";

const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

type GiftingData = {
  creator: {
    _id: string;
    username: string;
    name?: string;
    profile_photo: string;
  };
  videoId: string;
  setIsWantToGift: (value: boolean) => void;
  setIsGifted: (value: boolean) => void;
  giftMessage: any;
};

const CreatorPassBuy = ({
  creator,
  videoId,
  setIsWantToGift,
  setIsGifted,
  giftMessage,
}: GiftingData) => {
    const route = useRoute();
  const { id } = route.params as { id: string };
  const [userData, setUserData] = useState<any>(null);
  const [walletInfo, setWalletInfo] = useState<{ balance?: number }>({});
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const animatedBottom = useRef(new Animated.Value(insets.bottom)).current;

  const { token } = useAuthStore();

  useEffect(() => {
    console.log('creatorId', id)
    if (!id) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${BACKEND_API_URL}/user/profile/${id}`,
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
          throw new Error(data.message || "Failed to fetch user profile");
        }

        setUserData(data.user);
        console.log("Pubic User data", data.user);
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

  const purchasePass = async () => {
    if (!token && !id) {
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/interactions/purchase-with-wallet`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      if (!response.ok) throw new Error("Failed to provide creator pass");
      const data = await response.json();
      console.log("dWallet data---------------", data);
      //   giftMessage?.(data.gift);
      //   setIsWantToGift?.(false);
      //   setIsGifted(true);
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
        // (data.isLiked);
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
            setIsWantToGift={setIsWantToGift}
            profile={userData?.userDetails?.profile_photo}
            name={userData?.userDetails?.name}
            username={userData?.userDetails?.username}
          />
        </View>

        {/* Middle section */}
        <View className="items-center">
          <View className="flex-row items-center justify-center">
            <Text className="text-4xl text-white">
              ₹ {userData?.userDetails?.creator_profile?.creator_pass_price}
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
              loading
                ? "bg-gray-600"
                : "bg-[#008A3C]"
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

export default CreatorPassBuy;
