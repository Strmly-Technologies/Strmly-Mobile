import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, { useEffect } from "react";
import { ChevronLeft, Play } from "lucide-react-native";
import { useTransactionHistory } from "./useTransactionHistory";
import { useAuthStore } from "@/store/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";

const TotalWalletHistory = ({ closeTBalance }: any) => {
  const { token } = useAuthStore();
  const { transactions, isLoading, error, fetchSpendingHistory } =
    useTransactionHistory(token || "");

  useEffect(() => {
    if (token) {
      fetchSpendingHistory();
    }
  }, [token]);

  // Filter transactions to show only spending/purchases (debits)
  const spendingTransactions = transactions.filter(
    (transaction) =>
      transaction.type === "debit" &&
      (transaction.description.toLowerCase().includes("purchase") ||
        transaction.description.toLowerCase().includes("gift") ||
        transaction.description.toLowerCase().includes("subscription") ||
        transaction.description.toLowerCase().includes("creator pass") ||
        transaction.description.toLowerCase().includes("video purchase") ||
        transaction.description.toLowerCase().includes("series purchase") ||
        transaction.description.toLowerCase().includes("community fee") ||
        transaction.description.toLowerCase().includes("tip") ||
        transaction.description.toLowerCase().includes("payment") ||
        transaction.description.toLowerCase().includes("spent") ||
        !transaction.description.toLowerCase().includes("withdraw")) // Exclude withdrawals
  );

  const allowedCategories = [
    "video_purchase",
    "series_purchase",
    "video_gift",
    "creator_pass_purchase",
    "community_fee",
    "comment_gift"
  ];

  const filteredTransactions = transactions.filter((item) =>
    allowedCategories.includes(item.category)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View className="absolute flex-1 top-0 gap-5 w-full">
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
              Spending History
            </Text>
          </View>

          <View></View>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#fff" />
            <Text className="text-white mt-2">Loading spending history...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-400 text-center">{error}</Text>
            <TouchableOpacity
              onPress={() => fetchSpendingHistory()}
              className="mt-4 bg-blue-600 px-4 py-2 rounded"
            >
              <Text className="text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : spendingTransactions.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-400 text-center">
              No spending history found
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="flex-row items-center my-2">
                <View className="flex-row items-center gap-3 flex-1">
                  {/* Icon based on transaction type */}
                  {item.category == "video_purchase" ||
                  item.category == "series_purchase" || item.category == 'community_fee' ? (
                    <Pressable
                      onPress={() => console.log("Transaction pressed", item)}
                    >
                      <View className="w-12 h-12 rounded-full bg-gray-500 justify-center items-center">
                        <Play size={24} color="white" />
                      </View>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => console.log("Transaction pressed", item)}
                    >
                      <Image
                        source={
                          item.category == "video_gift" ||
                          item.category == "creator_pass_purchase" ||
                          item.category == "comment_gift"
                            ? require("../../../../assets/images/rupee.png")
                            : require("../../../../assets/images/bank-icon.png")
                        }
                        className="w-12 h-12 rounded-full bg-gray-500"
                      />
                    </Pressable>
                  )}

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
                <Text className="text-red-500 text-[16px]">
                  -₹{item.amount}
                </Text>
              </View>
            )}
            refreshing={isLoading}
            onRefresh={() => fetchSpendingHistory()}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default TotalWalletHistory;
