import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import { ChevronLeft } from "lucide-react-native";
import { useTransactionHistory } from "./useTransactionHistory";
import { useAuthStore } from "@/store/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";

const TotalBalanceHistory = ({ closeTBalance }: { closeTBalance: any }) => {
  const { token } = useAuthStore();
  const { transactions, isLoading, error, fetchWalletTransactions } =
    useTransactionHistory(token || "");

  useEffect(() => {
    if (token) {
      fetchWalletTransactions();
    }
  }, [token]);

  // Filter transactions to show only wallet deposits and withdrawals
  const walletTransactions = transactions.filter((transaction) => {
    // Check by category if available (backend provides this)
    if (transaction.category) {
      return (
        transaction.category === "wallet_load" ||
        transaction.category === "withdrawal_request"
      );
    }

    // Fallback to description-based filtering
    const desc = transaction.description.toLowerCase();
    return (
      desc.includes("deposit") ||
      desc.includes("withdrawal") ||
      desc.includes("added to wallet") ||
      desc.includes("withdraw from wallet") ||
      desc.includes("wallet load") ||
      desc.includes("wallet top-up") ||
      desc.includes("money added") ||
      desc.includes("money withdrawn")
    );
  });

  console.log("🔍 Total transactions:", transactions.length);
  console.log("🔍 Wallet transactions:", walletTransactions.length);
  console.log("🔍 Sample transactions:", transactions.slice(0, 3));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View className="absolute -top-2 gap-5 w-full">
      <SafeAreaView edges={[]}>
        <View className="w-full flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => closeTBalance(false)}
            className="p-2"
          >
            <ChevronLeft size={28} color={"white"} className="text-white" />
          </TouchableOpacity>

          <View>
            <Text className={`text-lg capitalize font-semibold text-white`}>
              Wallet History
            </Text>
          </View>

          <View></View>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#fff" />
            <Text className="text-white mt-2">Loading wallet history...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-400 text-center">{error}</Text>
            <TouchableOpacity
              onPress={() => fetchWalletTransactions()}
              className="mt-4 bg-blue-600 px-4 py-2 rounded"
            >
              <Text className="text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : walletTransactions.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-400 text-center">
              No wallet transactions found
            </Text>
          </View>
        ) : (
          <FlatList
            data={walletTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="flex-row items-center my-2">
                <View className="flex-row items-center gap-3 flex-1">
                  {/* Icon */}
                  <Image
                    source={require("../../../../assets/images/bank-icon.png")}
                    className="w-12 h-12 rounded-full bg-gray-500"
                  />

                  {/* Transaction Info */}
                  <View className="justify-center items-start">
                    <Text className="text-sm text-white">
                      {item.description}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {formatDate(item.date)}
                    </Text>
                    {item.status && (
                      <Text className="text-xs text-gray-400">
                        Status: {item.status}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Amount */}
                <Text
                  className={`${item.type === "debit" ? "text-red-500" : "text-green-500"} text-[16px]`}
                >
                  {item.type === "debit" ? "-" : "+"} ₹{item.amount}
                </Text>
              </View>
            )}
            refreshing={isLoading}
            onRefresh={() => fetchWalletTransactions()}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default TotalBalanceHistory;
