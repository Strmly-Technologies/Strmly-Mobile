import {
  View,
  Text,
  Dimensions,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Image,
} from "react-native";

import React, { useState } from "react";
import ThemedView from "@/components/ThemedView";
import CommonTopBar from "@/components/CommonTopBar";
import WalletButtons from "./_components/WalletButtons";
import TotalBalanceHistory from "./_components/TotalBalanceHistory";
import TotalWalletHistory from "./_components/TotalWalletHistory";

const { height } = Dimensions.get("window");

const WalletPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpenTBalance, setIsOpenTotalBalance] = useState<boolean>(false);
  const [isOpenWBalance, setIsOpenWalletBalance] = useState<boolean>(false);

  const [showSuccessModal, setShowSuccessModal] = useState(true); // default to true for demo

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
              <TouchableWithoutFeedback onPress={() => {}}>
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
                  <Text className="text-[28px] text-white">₹ 420.00</Text>
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
                  <Text className="text-[28px] text-white">₹ 500.00</Text>
                </View>
              </Pressable>

              {/* Card 3 */}

              <View className="bg-[#B0B0B033] flex-grow justify-center gap-2 items-center h-full rounded-xl py-4 px-6">
                <Text className="text-[14px] text-white">Revenue</Text>
                <Text className="text-[28px] text-white">₹ 120.00</Text>
              </View>
            </View>

            <Text className="text-white text-lg">Withdrawals request</Text>
            <View className="relative flex-row w-full items-center gap-3">
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
                <Text className="text-xs text-gray-500">15 July 11:29 AM</Text>
                <Text className="text-xs text-gray-500">Status: Process</Text>
              </View>

              <Text className="text-[#FF8D28] absolute right-0">-₹15</Text>
            </View>
          </View>

          <View className="flex justify-center h-full">
            <WalletButtons />
          </View>
        </>
      )}
    </ThemedView>
  );
};

export default WalletPage;
