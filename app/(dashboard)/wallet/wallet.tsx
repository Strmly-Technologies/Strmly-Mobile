import {
  View,
  Text,
  Dimensions,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";

import React, { useState, useEffect } from "react";
import ThemedView from "@/components/ThemedView";
import CommonTopBar from "@/components/CommonTopBar";
import WalletButtons from "./_components/WalletButtons";
import TotalBalanceHistory from "./_components/TotalBalanceHistory";
import TotalWalletHistory from "./_components/TotalWalletHistory";
import { useWallet } from "./_components/useWallet";
import { useAuthStore } from "@/store/useAuthStore";

const { height } = Dimensions.get("window");

const WalletPage = () => {
  // Get token from auth store
  const { token } = useAuthStore();

  // Debug token
  useEffect(() => {
    console.log('=== WALLET TOKEN CHECK ===');
    console.log('Token from auth store:', token);
    console.log('Token type:', typeof token);
    console.log('Token length:', token?.length);
    console.log('Is logged in:', useAuthStore.getState().isLoggedIn);
    console.log('Auth state:', useAuthStore.getState());
    console.log('=========================');
  }, [token]);
  
  const {
    walletData,
    withdrawals,
    isLoading,
    error,
    fetchWalletDetails,
    createLoadOrder,
    verifyPayment,
    requestWithdrawal,
    clearError
  } = useWallet(token || '');

  const [isOpenTBalance, setIsOpenTotalBalance] = useState<boolean>(false);
  const [isOpenWBalance, setIsOpenWalletBalance] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Handle withdrawal request
  const handleWithdrawalRequest = async (amount: number) => {
    try {
      await requestWithdrawal(amount);
      setShowSuccessModal(true);
    } catch (err) {
      Alert.alert("Error", "Failed to create withdrawal request");
    }
  };

  // Show error alert when error occurs
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [
        { text: "OK", onPress: clearError }
      ]);
    }
  }, [error]);

  return (
    <ThemedView
      style={{
        height,
        backgroundColor: showSuccessModal ? "#B0B0B0BB" : "black",
      }}
      className="relative gap-8 py-20 px-4"
    >
      <CommonTopBar />

      {showSuccessModal && (
        <Modal transparent visible={showSuccessModal} animationType="fade">
          <TouchableWithoutFeedback onPress={() => setShowSuccessModal(false)}>
            <View className="flex-1 bg-transparent bg-opacity-80 bottom-60 items-center justify-end px-5 right-0">
              <TouchableWithoutFeedback onPress={() => { }}>
                <View className="bg-[#1E1E1E] p-6 rounded-xl">
                  <Text className="text-white text-base text-center mb-2 font-semibold">
                    Your withdrawal request of ₹500 has been successfully
                    placed.
                  </Text>
                  <Text className="text-gray-300 text-sm text-center">
                    Processing Time: It may take 3 to 7 working days.
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {isOpenTBalance || isOpenWBalance ? (
        <View>
          {isOpenTBalance ? <TotalBalanceHistory /> : <TotalWalletHistory />}
        </View>
      ) : (
        <>
          <View className="gap-5">
            {/* Card 1 */}
            <View className="bg-[#B0B0B033] p-4 rounded-xl h-[91px]">
              <Pressable onPress={() => setIsOpenTotalBalance(!isOpenTBalance)}>
                <View className="justify-center gap-3">
                  <Text className="text-[14px] text-white">Total balance</Text>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-[28px] text-white">
                      ₹ {walletData?.balance?.toFixed(2) || "0.00"}
                    </Text>
                  )}
                </View>
              </Pressable>
            </View>

            {/* Additional Cards */}
            <View className="flex-row items-center h-[91px] justify-between gap-4">
              {/* Card 2 */}
              <Pressable
                onPress={() => setIsOpenWalletBalance(!isOpenWBalance)}
              >
                <View className="bg-[#B0B0B033] flex-grow justify-center gap-2 rounded-xl h-full items-center p-4">
                  <Text className="text-[14px] text-white">Wallet balance</Text>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-[28px] text-white">
                      ₹ {walletData?.balance?.toFixed(2) || "0.00"}
                    </Text>
                  )}
                </View>
              </Pressable>

              {/* Card 3 */}

              <View className="bg-[#B0B0B033] flex-grow justify-center gap-2 items-center h-full rounded-xl py-4 px-6">
                <Text className="text-[14px] text-white">Revenue</Text>
                <Text className="text-[28px] text-white">₹ 120.00</Text>
              </View>
            </View>

            <Text className="text-white text-lg">Withdrawals request</Text>
            {withdrawals.length > 0 ? (
              withdrawals.slice(0, 3).map((withdrawal) => (
                <View key={withdrawal.id} className="relative flex-row w-full items-center gap-3">
                  {/* Profile Picture */}
                  <Image
                    source={require("../../../assets/images/bank-icon.png")}
                    className="w-12 h-12 rounded-full bg-gray-500"
                  />

                  {/* User Info */}
                  <View className="justify-center gap-1 items-start">
                    <Text className="text-sm text-white">
                      Withdraw request from wallet
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {new Date(withdrawal.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      Status: {withdrawal.status}
                    </Text>
                  </View>

                  <Text className="text-[#FF8D28] absolute right-0">
                    -₹{withdrawal.amount}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-400 text-center">No withdrawal requests</Text>
            )}
          </View>

          <View className="flex justify-center h-full">
            <WalletButtons
              onWithdraw={handleWithdrawalRequest}
              onCreateOrder={createLoadOrder}
              onVerifyPayment={verifyPayment}
              onRefreshWallet={fetchWalletDetails}
              walletBalance={walletData?.balance || 0}
            />
          </View>
        </>
      )}
    </ThemedView>
  );
};

export default WalletPage;
