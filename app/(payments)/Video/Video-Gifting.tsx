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
  Dimensions,
  Image,
  Alert,
} from "react-native";
import CreatorInfo from "./_components/CreatorInfo";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGiftingStore } from "@/store/useGiftingStore";
import ModalMessage from "@/components/AuthModalMessage";

const { height } = Dimensions.get("window");
const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

type GiftingData = {
  creator: {
    _id: string;
    username: string;
    name?: string;
    profile_photo: string;
  };
  videoId: string;
  setIsWantToGift?: (value: boolean) => void;
  setIsGifted?: (value: boolean) => void;
  giftMessage?: string;
};

const VideoContentGifting = ({
  setIsWantToGift,
  setIsGifted,
  giftMessage,
}: GiftingData) => {
  const {
    mode,
    commentId,
    creatorName,
    creatorUsername,
    creatorPhoto,
    creatorId,
    videoId: routeVideoId,
  } = useLocalSearchParams();
  const isWithdrawMode = mode === "withdraw";
  const isCommentGiftMode = mode === "comment-gift";

  const [handleClickAmount, setHandleClickAmount] = useState(false);

  const { creator, videoId, completeGifting } = useGiftingStore();
  // Use route videoId for comment gifting, prop videoId for video gifting
  const currentVideoId = isCommentGiftMode ? routeVideoId : videoId;

  // Debug log the parameters
  console.log("🔍 Route parameters:", {
    mode,
    commentId,
    videoId: currentVideoId,
    propVideoId: videoId,
    routeVideoId,
    creatorName,
    creatorUsername,
    creatorPhoto,
    creatorId,
  });
  const [amount, setAmount] = useState("");
  const [userUPI, setUserUPI] = useState("");
  const [walletInfo, setWalletInfo] = useState<{ balance?: number }>({});
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<number | null>(null);
  const [isWithdrawalComplete, setIsWithdrawalComplete] =
    useState<boolean>(false);
  const [isWithdrawalCompleteMessage, setIsWithdrawalCompleteMessage] =
    useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const keyboardHeight = useRef(new Animated.Value(0)).current;

  // const insets = useSafeAreaInsets();
  // const animatedBottom = useRef(new Animated.Value(insets.bottom)).current;

  const { token } = useAuthStore();

  const handleCloseModalMessage = () => {
    setIsWithdrawalComplete(false);
    setIsWithdrawalCompleteMessage(null);
    router.back();
  };

  useEffect(() => {
    if (mode === "withdraw") {
      setStep(1);
    }
  }, [mode]);

  const handleAmountChange = (text: string) => {
    const filtered = text.replace(/[^0-9]/g, "");
    setAmount(filtered);
    setError(null); // Clear error when user types
  };

  const handleUpiChange = (text: string) => {
    setUserUPI(text);
    setError(null); // Clear error when user types
  };

  // ------------ Transaction -------------------

  const giftVideo = async () => {
    console.log("🎁 Debug - Gift Video Parameters:", {
      token: token ? "Present" : "Missing",
      videoId: videoId || "Missing",
      amount: amount || "Missing",
    });

    if (!token || !videoId) {
      const missingFields = [];
      if (!token) missingFields.push("token");
      if (!videoId) missingFields.push("videoId");

      setError(`Missing required information: ${missingFields.join(", ")}`);
      return;
    }

    const giftAmount = parseInt(amount);
    if (giftAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (walletInfo.balance && giftAmount > walletInfo.balance) {
      setError("Insufficient balance");
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/interactions/gift-video`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videoId: videoId, amount: giftAmount }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to provide gifting: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ Gift Video Success:", data);

      // Setting data when gifting done
      completeGifting(data.gift.amount);

      router.back();
    } catch (err) {
      console.error("❌ Gift Video Error:", err);
      setError(err instanceof Error ? err.message : "Failed to send gift");
    }
  };

  const giftCommentHandler = async () => {
    console.log("🔍 Debug - Checking required parameters:", {
      token: token ? "Present" : "Missing",
      commentId: commentId || "Missing",
      videoId: currentVideoId || "Missing",
      amount: amount || "Missing",
    });

    if (!token || !commentId || !currentVideoId || !amount) {
      const missingFields = [];
      if (!token) missingFields.push("token");
      if (!commentId) missingFields.push("commentId");
      if (!currentVideoId) missingFields.push("videoId");
      if (!amount) missingFields.push("amount");

      setError(`Missing required information: ${missingFields.join(", ")}`);
      return;
    }

    const giftAmount = parseInt(amount);
    if (giftAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (walletInfo.balance && giftAmount > walletInfo.balance) {
      setError("Insufficient balance");
      return;
    }

    try {
      console.log("🎁 Gifting comment with:", {
        commentId,
        videoId,
        amount: giftAmount,
      });

      // Use direct API call with correct URL format
      const response = await fetch(
        `${BACKEND_API_URL}/interactions/gift-comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commentId: commentId as string,
            videoId: currentVideoId as string,
            videoType: "long",
            amount: giftAmount,
            giftNote: `Gift of ₹${giftAmount}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send gift");
      }

      const data = await response.json();

      console.log("✅ Comment gift response:", data);

      // Show success message
      setSuccessMessage(
        `Successfully gifted ₹${giftAmount} to ${creatorName || "the creator"}!`
      );
    } catch (err: any) {
      console.error("❌ Comment gift error:", err);

      // Provide more user-friendly error messages
      if (err.message === "Comment not monetized") {
        setError(
          "This comment cannot receive gifts. The creator may not have enabled comment monetization for this content."
        );
      } else if (err.message.includes("insufficient")) {
        setError(
          "Insufficient wallet balance. Please add money to your wallet."
        );
      } else {
        setError(err.message || "Failed to send gift");
      }
    }
  };

  const withdrawMoney = async () => {
    if (!token || !amount) {
      return;
    }

    const withdrawAmount = parseInt(amount);

    // Validate amount
    if (withdrawAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (walletInfo.balance && withdrawAmount > walletInfo.balance) {
      setError("Insufficient balance");
      return;
    }

    if (withdrawAmount < 100) {
      setError("Minimum withdrawal amount is ₹100");
      return;
    }

    setError(null);

    try {
      console.log("💰 Creating withdrawal request for amount:", withdrawAmount);

      const response = await fetch(
        `${BACKEND_API_URL}/withdrawal/manual/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: withdrawAmount }),
        }
      );

      const data = await response.json();
      console.log("✅ Withdrawal API response:", data);

      // Check for specific error codes first, regardless of HTTP status
      if (!data.success) {
        setError(data.error || "Failed to create withdrawal request");
        return;
      }

      // Check HTTP status for other errors
      if (!response.ok) {
        setError(data.error || `Server error: ${response.status}`);
        return;
      }

      setIsWithdrawalCompleteMessage(data.message);
      setIsWithdrawalComplete(true);
      setStep(null);
    } catch (err) {
      console.error("❌ Withdrawal error:", err);
      if (err instanceof SyntaxError && err.message.includes("JSON")) {
        setError(
          "Server returned invalid response. Please check your connection."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create withdrawal request"
        );
      }
    }
  };

  const handleUpdateUPI = async () => {
    if (!token || !userUPI) {
      return;
    }

    if (userUPI.length < 13 && !userUPI.includes("@")) {
      Alert.alert("Incorrect UPI");
    }

    setError(null);

    try {
      console.log(" User UPI:", userUPI);

      const response = await fetch(
        `${BACKEND_API_URL}/withdrawal/create-or-update-upi`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ upi_id: userUPI }),
        }
      );

      const data = await response.json();
      console.log("✅ User UPI response:", data);

      // Check for specific error codes first, regardless of HTTP status
      if (!data.success) {
        setError(data.error || "Failed to save or update UPI");
        return;
      }

      // Check HTTP status for other errors
      if (!response.ok) {
        setError(data.error || `Server error: ${response.status}`);
        return;
      }

      setStep(2);
    } catch (err) {
      console.error("❌ UPI update error:", err);
      if (err instanceof SyntaxError && err.message.includes("JSON")) {
        setError(
          "Server returned invalid response. Please check your connection."
        );
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to save or update UPI ID"
        );
      }
    }
  };

  const handleProceed = async () => {
    console.log("🚀 Handle Proceed called with:", {
      isWithdrawMode,
      isCommentGiftMode,
      amount,
      videoId,
      creator,
    });

    setLoading(true);
    setError(null);

    try {
      if (isWithdrawMode) {
        await withdrawMoney();
      } else if (isCommentGiftMode) {
        await giftCommentHandler();
      } else {
        await giftVideo();
      }
    } catch (error) {
      console.error("❌ Handle Proceed Error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
      Keyboard.dismiss();
    }
  };

  useEffect(() => {
    const keyboardShow = (e: KeyboardEvent) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    const keyboardHide = () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    const showSub: EmitterSubscription =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillShow", keyboardShow)
        : Keyboard.addListener("keyboardDidShow", keyboardShow);
    const hideSub: EmitterSubscription =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillHide", keyboardHide)
        : Keyboard.addListener("keyboardDidHide", keyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <ThemedView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 50}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-between px-5">
              {/* Top section */}
              <View className="mt-5">
                {isWithdrawMode ? (
                  <View className="flex-row items-center justify-between mb-8">
                    <Pressable onPress={() => router.back()} className="p-2">
                      <ChevronLeft size={28} color="white" />
                    </Pressable>
                    <Text className="text-white text-xl font-semibold">
                      Withdraw from account
                    </Text>
                    <View className="w-8" />
                  </View>
                ) : isCommentGiftMode ? (
                  <View className="flex-row items-center justify-between mb-8">
                    <Pressable onPress={() => router.back()} className="p-2">
                      <ChevronLeft size={28} color="white" />
                    </Pressable>
                    <Text className="text-white text-xl font-semibold">
                      Gift Comment
                    </Text>
                    <View className="w-8" />
                  </View>
                ) : (
                  creator && (
                    <CreatorInfo
                      profile={creator?.profile_photo}
                      name={creator?.name}
                      username={creator?.username}
                    />
                  )
                )}

                {/* Show creator info for comment gifting */}
                {isCommentGiftMode && (
                  <View className="items-center mb-6">
                    <View className="w-16 h-16 rounded-full bg-gray-600 mb-3 overflow-hidden">
                      {creatorPhoto ? (
                        <Image
                          source={{ uri: creatorPhoto as string }}
                          className="w-full h-full"
                        />
                      ) : (
                        <View className="w-full h-full bg-gray-600 items-center justify-center">
                          <Text className="text-white text-lg">
                            {(creatorName as string)?.charAt(0) || "U"}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-white text-lg font-semibold">
                      {creatorName || "Anonymous User"}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      @{creatorUsername || "user"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Middle section */}
              <View className="items-center">
                {isWithdrawMode && step === 1 ? (
                  <View className="flex-row items-center absolute -top-20">
                    <Text className="text-xl text-white">Your UPI: </Text>
                    <TextInput
                      value={userUPI}
                      onChangeText={handleUpiChange}
                      keyboardType="default"
                      returnKeyType={Platform.OS === "ios" ? "done" : "none"}
                      placeholder="xxxxxxx584@ibl"
                      placeholderTextColor="#666"
                      className="text-xl border-b border-blue-700 text-white placeholder:text-gray-500 font-semibold px-1 items-center justify-center"
                      style={{ minWidth: 100, textAlign: "center" }}
                    />
                  </View>
                ) : (
                  <View className="flex-row items-center justify-center">
                    <Text className="text-4xl text-white">₹</Text>
                    <TextInput
                      value={amount}
                      onChangeText={handleAmountChange}
                      onPress={() => setHandleClickAmount(true)}
                      keyboardType="number-pad"
                      returnKeyType={Platform.OS === "ios" ? "done" : "none"}
                      placeholder="0"
                      placeholderTextColor="#666"
                      className="text-3xl text-white placeholder:text-gray-500 font-semibold items-center justify-center"
                      style={{ minWidth: 100, textAlign: "center" }}
                    />
                  </View>
                )}

                {/* Error Message */}
                {error && (
                  <View className="mt-4">
                    <Text className="text-red-400 text-sm text-center">
                      {error}
                    </Text>
                    {error.includes("setup bank") && (
                      <Pressable
                        onPress={() => {
                          console.log("🔧 Manual navigation to bank setup");
                          router.push("/(payments)/BankSetup");
                        }}
                        className="mt-2 p-2 bg-blue-600 rounded"
                      >
                        <Text className="text-white text-center text-sm">
                          Setup Bank Account
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}

                {/* Success Message */}
                {successMessage && (
                  <View className="mt-4 p-4 bg-green-600 rounded-lg">
                    <Text className="text-white text-sm text-center">
                      {successMessage}
                    </Text>
                    <Text className="text-green-200 text-xs text-center mt-1">
                      Returning to comments...
                    </Text>
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
                  bottom: Animated.add(
                    new Animated.Value(handleClickAmount ? 0 : 50),
                    0
                  ),
                  // paddingBottom: 10,
                }}
                className="gap-2 justify-end"
              >
                <Pressable
                  disabled={
                    loading ||
                    (step === 1
                      ? userUPI.length < 13 || !userUPI.includes("@")
                      : !amount || parseInt(amount) <= 0) ||
                    successMessage !== null
                  }
                  onPress={step === 1 ? handleUpdateUPI : handleProceed}
                  className={`p-4 rounded-lg items-center justify-center ${
                    loading ||
                    (step === 1
                      ? userUPI.length < 13 || !userUPI.includes("@")
                      : !amount || parseInt(amount) <= 0) ||
                    successMessage !== null
                      ? "bg-gray-600"
                      : "bg-[#008A3C]"
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white text-base font-semibold">
                      {isWithdrawMode
                        ? step === 1
                          ? "Update and continue"
                          : "Withdraw"
                        : isCommentGiftMode
                          ? "Send Gift"
                          : "Proceed"}
                    </Text>
                  )}
                </Pressable>

                <View className="items-center justify-center mt-1">
                  <Text className="text-white text-sm">
                    {isWithdrawMode ? "Current balance" : "Total balance"} ₹
                    {walletInfo.balance?.toFixed(2) || "0.00"}
                  </Text>
                </View>

                {isWithdrawMode && (
                  <View className="items-center justify-center mt-2">
                    <Text className="text-gray-400 text-xs text-center">
                      Minimum withdrawal: ₹100{"\n"}
                      Processing time: 3-7 working days
                    </Text>
                  </View>
                )}
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        {isWithdrawalComplete && (
          <ModalMessage
            visible={isWithdrawalComplete}
            text={isWithdrawalCompleteMessage || ""}
            needCloseButton={true}
            onClose={handleCloseModalMessage}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
};

export default VideoContentGifting;
