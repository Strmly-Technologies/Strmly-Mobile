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
} from "react-native";
import CreatorInfo from "./_components/CreatorInfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";

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

const VideoContentGifting = ({
  creator,
  videoId,
  setIsWantToGift,
  setIsGifted,
  giftMessage,
}: GiftingData) => {
  const { mode } = useLocalSearchParams();
  const isWithdrawMode = mode === 'withdraw';
  const [amount, setAmount] = useState("");
  const [walletInfo, setWalletInfo] = useState<{ balance?: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keyboardHeight = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();
  const animatedBottom = useRef(new Animated.Value(insets.bottom)).current;

  const { token, isLoggedIn } = useAuthStore();

  const handleAmountChange = (text: string) => {
    const filtered = text.replace(/[^0-9]/g, "");
    setAmount(filtered);
    setError(null); // Clear error when user types
  };

  // ------------ Transaction -------------------

  const giftVideo = async (amount=50) => {
    if (!token && !videoId) {
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
          body: JSON.stringify({ videoId: videoId, amount, }),
        }
      );
      
      if (!response.ok) throw new Error("Failed to provide gifting");
      const data = await response.json();
      console.log("dWallet data---------------", data);
      giftMessage?.(data.gift);
      setIsWantToGift?.(false);
      setIsGifted(true);
    } catch (err) {
      console.log(err);
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
      console.log('💰 Creating withdrawal request for amount:', withdrawAmount);
      console.log('🔗 API URL:', `${BACKEND_API_URL}/withdrawal/create`);
      console.log('🔑 Token:', token?.substring(0, 20) + '...');

      const response = await fetch(
        `${BACKEND_API_URL}/withdrawal/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: withdrawAmount }),
        }
      );

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Non-JSON response:', textResponse);
        setError('Server returned invalid response. Please try again.');
        return;
      }

      const data = await response.json();
      console.log('✅ Withdrawal API response:', data);

      // Check for specific error codes first, regardless of HTTP status
      if (!data.success) {
        console.log('❌ API returned success: false');
        console.log('🔍 Error code:', data.code);
        console.log('🔍 Error message:', data.error);
        
        if (data.code === "BANK_ACCOUNT_NOT_SETUP") {
          console.log('🏦 Navigating to bank setup...');
          try {
            // Navigate to bank setup form
            setTimeout(() => {
              router.push('/(payments)/BankSetup');
              console.log('✅ Navigation initiated');
            }, 100);
          } catch (navError) {
            console.error('❌ Navigation error:', navError);
            // Fallback: show error with manual button
            setError(data.error + " - Please setup your bank account");
          }
          return;
        }
        setError(data.error || "Failed to create withdrawal request");
        return;
      }

      // Check HTTP status for other errors
      if (!response.ok) {
        setError(data.error || `Server error: ${response.status}`);
        return;
      }

      router.back();
    } catch (err) {
      console.error('❌ Withdrawal error:', err);
      if (err instanceof SyntaxError && err.message.includes('JSON')) {
        setError('Server returned invalid response. Please check your connection.');
      } else {
        setError(err instanceof Error ? err.message : "Failed to create withdrawal request");
      }
    }
  };

  const handleProceed = async () => {
    setLoading(true);
    if (isWithdrawMode) {
      await withdrawMoney();
    } else {
      await giftVideo();
    }
    setLoading(false);
    Keyboard.dismiss();
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
    <ThemedView className="flex-1 bg-black">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-between pt-10 px-5">
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
              ) : (
                <CreatorInfo
                setIsWantToGift={setIsWantToGift}
                profile={creator?.profile_photo}
                name={creator?.name}
                username={creator?.username}
              />
              )}
            </View>

            {/* Middle section */}
            <View className="items-center">
              <View className="flex-row items-center justify-center">
                <Text className="text-4xl text-white">₹</Text>
                <TextInput
                  value={amount}
                  onChangeText={handleAmountChange}
                  keyboardType="number-pad"
                  returnKeyType={Platform.OS === "ios" ? "done" : "none"}
                  placeholder="0"
                  placeholderTextColor="#666"
                  className="text-3xl text-white placeholder:text-gray-500 font-semibold items-center justify-center"
                  style={{ minWidth: 100, textAlign: 'center' }}
                />
              </View>

              {/* Error Message */}
              {error && (
                <View className="mt-4">
                  <Text className="text-red-400 text-sm text-center">{error}</Text>
                  {error.includes('setup bank') && (
                    <Pressable 
                      onPress={() => {
                        console.log('🔧 Manual navigation to bank setup');
                        router.push('/(payments)/BankSetup');
                      }}
                      className="mt-2 p-2 bg-blue-600 rounded"
                    >
                      <Text className="text-white text-center text-sm">Setup Bank Account</Text>
                    </Pressable>
                  )}
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
                disabled={loading || !amount || parseInt(amount) <= 0}
                onPress={handleProceed}
                className={`p-4 rounded-lg items-center justify-center ${loading || !amount || parseInt(amount) <= 0
                  ? 'bg-gray-600'
                  : 'bg-[#008A3C]'
                  }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    {isWithdrawMode ? 'Withdraw' : 'Proceed'}
                  </Text>
                )}
              </Pressable>

              <View className="items-center justify-center mt-1">
                <Text className="text-white text-sm">
                  {isWithdrawMode ? 'Current balance' : 'Total balance'} ₹{walletInfo.balance?.toFixed(2) || '0.00'}
                </Text>
              </View>

              {isWithdrawMode && (
                <View className="items-center justify-center mt-2">
                  <Text className="text-gray-400 text-xs text-center">
                    Minimum withdrawal: ₹100{'\n'}
                    Processing time: 3-7 working days
                  </Text>
                </View>
              )}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default VideoContentGifting;
