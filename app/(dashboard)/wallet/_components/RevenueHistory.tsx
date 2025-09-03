import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import { ChevronLeft, Play, Users } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useDashboard } from "../../profile/_components/useDashboard";
import { SafeAreaView } from "react-native-safe-area-context";

const RevenueHistory = ({ closeTBalance }: { closeTBalance: any }) => {
  const { token } = useAuthStore();
  const { revenueBreakdown, loading, error } = useDashboard(
    token || "",
    "revenue"
  );

  // Create revenue history items from dashboard data
  const revenueItems = React.useMemo(() => {
    console.log("🔍 RevenueHistory - revenueBreakdown:", revenueBreakdown);

    if (!revenueBreakdown) return [];

    const items = [];
    const currentDate = new Date().toISOString();

    // Show all revenue sources, including those with 0 values
    items.push({
      id: "content",
      description: "Content Subscription",
      amount: revenueBreakdown.contentSubscription || 0,
      date: currentDate,
      type: "content",
    });

    items.push({
      id: "creator-pass",
      description: "Creator Pass",
      amount: revenueBreakdown.creatorPass || 0,
      date: currentDate,
      type: "creator-pass",
    });

    items.push({
      id: "gifting",
      description: "Gifting Earnings",
      amount: revenueBreakdown.giftingEarning || 0,
      date: currentDate,
      type: "gifting",
    });

    items.push({
      id: "community",
      description: "Community Fee",
      amount: revenueBreakdown.communityFee || 0,
      date: currentDate,
      type: "community",
    });

    items.push({
      id: "ads",
      description: "Strmly Ads",
      amount: revenueBreakdown.strmlyAds || 0,
      date: currentDate,
      type: "ads",
    });

    console.log("🔍 RevenueHistory - generated items:", items);
    return items;
  }, [revenueBreakdown]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "content":
      case "creator-pass":
        return (
          <View className="w-12 h-12 rounded-full bg-gray-500 justify-center items-center">
            <Play size={24} color="white" />
          </View>
        );
      case "community":
        return (
          <View className="w-12 h-12 rounded-full bg-gray-500 justify-center items-center">
            <Users size={24} color="white" />
          </View>
        );
      case "gifting":
        return (
          <Image
            source={require("../../../../assets/images/rupee.png")}
            className="w-12 h-12 rounded-full bg-gray-500"
          />
        );
      case "ads":
        return (
          <Image
            source={require("../../../../assets/images/bank-icon.png")}
            className="w-12 h-12 rounded-full bg-gray-500"
          />
        );
      default:
        return (
          <Image
            source={require("../../../../assets/images/rupee.png")}
            className="w-12 h-12 rounded-full bg-gray-500"
          />
        );
    }
  };

  return (
    <View className="absolute -top-2 gap-5 w-full">
      <SafeAreaView style={{ flex: 1 }} edges={[]}>
        <View className="w-full flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => closeTBalance(false)}
            className="p-2"
          >
            <ChevronLeft size={28} color={"white"} className="text-white" />
          </TouchableOpacity>

          <View>
            <Text className={`text-lg capitalize font-semibold text-white`}>
              Revenue History
            </Text>
          </View>

          <View></View>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#fff" />
            <Text className="text-white mt-2">Loading revenue...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-400 text-center">{error}</Text>
          </View>
        ) : revenueItems.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-400 text-center">
              No revenue data found
            </Text>
            <Text className="text-gray-500 text-xs mt-2">
              Debug: {JSON.stringify(revenueBreakdown)}
            </Text>
          </View>
        ) : (
          <FlatList
            data={revenueItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="flex-row items-center my-2">
                <View className="flex-row items-center gap-3 flex-1">
                  {/* Icon */}
                  {renderIcon(item.type)}

                  {/* Revenue Info */}
                  <View className="justify-center items-start">
                    <Text className="text-sm text-white">
                      {item.description}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {formatDate(item.date)}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      Revenue Source
                    </Text>
                  </View>
                </View>

                {/* Amount */}
                <Text className="text-green-500 text-[16px]">
                  +₹{item.amount.toFixed(2)}
                </Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default RevenueHistory;
