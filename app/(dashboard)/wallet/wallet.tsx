import { View, Text, Dimensions, Pressable } from "react-native";
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

  return (
    <ThemedView style={{ height }} className="gap-8 px-4">
      <CommonTopBar />

      {isOpenTBalance || isOpenWBalance ? (
        <View>
            {
              isOpenTBalance ?
              <TotalBalanceHistory /> 
              :
              <TotalWalletHistory />
            }
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
              <Pressable onPress={() => setIsOpenWalletBalance(!isOpenWBalance)}>
                <View className="bg-[#B0B0B033] flex-grow justify-center gap-2 rounded-xl h-full items-center shadow-md p-4">
                  <Text className="text-[14px] text-white">Wallet balance</Text>
                  <Text className="text-[28px] text-white">₹ 500.00</Text>
                </View>
              </Pressable>

              {/* Card 3 */}
              <View className="bg-[#B0B0B033] flex-grow justify-center gap-2 items-center h-full rounded-xl shadow-md py-4 px-6">
                <Text className="text-[14px] text-white">Revenue</Text>
                <Text className="text-[28px] text-white">₹ 120.00</Text>
              </View>
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
