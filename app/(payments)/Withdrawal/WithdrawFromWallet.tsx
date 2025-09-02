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
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { ChevronLeft } from "lucide-react-native";
import { createWithdrawalRequest } from "@/api/wallet/walletActions";
import { useWallet } from "@/app/(dashboard)/wallet/_components/useWallet";

const WithdrawFromWallet = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const animatedBottom = useRef(new Animated.Value(insets.bottom)).current;

  const { token } = useAuthStore();
  const { walletData, error: walletError, isLoading: walletLoading, fetchWalletDetails } = useWallet(token || "");

  const handleAmountChange = (text: string) => {
    const filtered = text.replace(/[^0-9]/g, "");
    setAmount(filtered);
    setError(null); // Clear error when user types
  };

  const handleWithdraw = async () => {
    if (!token || !amount) {
      return;
    }

    const withdrawAmount = parseInt(amount);
    
    // Validate amount
    if (withdrawAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (walletData?.balance && withdrawAmount > walletData.balance) {
      setError("Insufficient balance");
      return;
    }

    if (withdrawAmount < 100) {
      setError("Minimum withdrawal amount is ₹100");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💰 Creating withdrawal request for amount:', withdrawAmount);
      
      const response = await createWithdrawalRequest(token, withdrawAmount);
      console.log('✅ Withdrawal request created:', response);
      
      // Show success and navigate back
      router.back();
      
      // You might want to show a success modal here
      // Alert.alert('Success', 'Withdrawal request submitted successfully');
      
    } catch (err) {
      console.error('❌ Withdrawal error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    await handleWithdraw();
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

  // Handle wallet errors
  useEffect(() => {
    if (walletError) {
      console.error("❌ Error fetching wallet info:", walletError);
      setError(walletError);
    }
  }, [walletError]);

  // Wallet data is automatically fetched by useWallet hook

  return (
    <ThemedView className="flex-1 bg-black">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-between px-5 py-6">
            {/* Header */}
            <View className="mt-10">
              <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                  <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-semibold">
                  Withdraw from account
                </Text>
                <View className="w-8" />
              </View>
            </View>

            {/* Amount Input Section */}
            <View className="gap-2 flex-row items-center justify-center">
              <Text className="text-2xl text-white">₹</Text>
              <TextInput
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                returnKeyType={Platform.OS === "ios" ? "done" : "none"}
                placeholder="0"
                placeholderTextColor="#666"
                className="text-3xl text-white placeholder:text-gray-500 font-semibold items-center justify-center"
                style={{ minWidth: 100, textAlign: 'center' }}
              />
            </View>

            {/* Error Message */}
            {error && (
              <View className="items-center">
                <Text className="text-red-400 text-sm">{error}</Text>
              </View>
            )}

            <View></View>

            {/* Bottom Section */}
            <Animated.View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: Animated.add(new Animated.Value(5), animatedBottom),
                paddingBottom: insets.bottom,
              }}
              className="gap-2 justify-end px-5"
            >
              <Pressable 
                disabled={loading || !amount || parseInt(amount) <= 0} 
                onPress={handleProceed}
                className={`p-4 rounded-lg items-center justify-center ${
                  loading || !amount || parseInt(amount) <= 0 
                    ? 'bg-gray-600' 
                    : 'bg-[#008A3C]'
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    Withdraw
                  </Text>
                )}
              </Pressable>

              <View className="items-center justify-center mt-1">
                <Text className="text-white text-sm">
                  Current balance ₹{walletLoading ? "Loading..." : walletData?.balance?.toFixed(2) || '0.00'}
                </Text>
              </View>

              {/* Withdrawal Info */}
              <View className="items-center justify-center mt-2">
                <Text className="text-gray-400 text-xs text-center">
                  Minimum withdrawal: ₹100{'\n'}
                  Processing time: 3-7 working days
                </Text>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default WithdrawFromWallet;