import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  StatusBar,
  Alert,
  Dimensions,
} from "react-native";
import { ArrowLeft, MoreVertical, Play, Film, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  usePurchasedAccess,
  type Asset,
  type CreatorPass,
} from "./_components/usePurchasedAccess";
import { useRoute } from "@react-navigation/native";
import { getProfilePhotoUrl } from "@/utils/profileUtils";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("screen");

export default function AccessPage() {
  const [activeTab, setActiveTab] = useState<"content" | "series" | "creator">(
    "content"
  );
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const route = useRoute();
  const { routeTab } = route.params as { routeTab: string };
  const router = useRouter();

  const {
    data: purchasedData,
    isLoading,
    error,
    removeAsset,
  } = usePurchasedAccess();

  useEffect(() => {
    if (
      routeTab === "content" ||
      routeTab === "series" ||
      routeTab === "creator"
    ) {
      setActiveTab(routeTab);
    }
  }, [routeTab]);

  const handleRemoveAccess = async (
    id: string,
    type: "asset" | "creator_pass"
  ) => {
    Alert.alert(
      "Remove Access",
      `Are you sure you want to remove this ${type === "asset" ? "content" : "creator pass"} from your purchased access?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsRemoving(id);
            try {
              await removeAsset(id, type);
              Alert.alert("Success", "Access removed successfully");
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to remove access. Please try again."
              );
            } finally {
              setIsRemoving(null);
              setActiveDropdown(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case "content":
        return purchasedData.assets.filter(
          (asset) => asset.content_type === "video"
        );
      case "series":
        return purchasedData.assets.filter(
          (asset) => asset.content_type === "series"
        );
      case "creator":
        return purchasedData.creator_passes;
      default:
        return [];
    }
  };

  const renderTabButton = (
    tab: "content" | "series" | "creator",
    label: string
  ) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      className={`flex-1 pb-4 ${activeTab === tab ? "border-b-2 border-white" : ""}`}
    >
      <Text
        className={`text-center font-medium ${
          activeTab === tab ? "text-white" : "text-gray-400"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const handleAssetClick = (asset: Asset) => {
    if (asset.content_type === "video") {
      // Navigate to video feed with the specific video
      try {
        router.push({
          pathname: "/(tabs)/home",
          params: {
            videoId: asset.content_id,
            startWithVideo: "true",
          },
        });
      } catch (error) {
        Alert.alert("Error", "Failed to open video player");
      }
    } else if (asset.content_type === "series") {
      // Navigate to series details screen
      try {
        router.push({
          pathname: "/studio/screens/SeriesDetailsScreen",
          params: {
            seriesId: asset.content_id,
            title:
              asset.asset_data.title || asset.asset_data.name || "Untitled",
          },
        });
      } catch (error) {
        Alert.alert("Error", "Failed to open series details");
      }
    }
  };

  const renderAssetItem = (asset: Asset) => (
    <View key={asset._id} className="relative">
      <TouchableOpacity
        onPress={() => handleAssetClick(asset)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={["#000000", "#0a0a0a", "#1a1a1a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-row items-center p-4 rounded-lg mb-3"
        >
          <View className="relative">
            <Image
              source={{
                uri:
                  asset.asset_data.thumbnailUrl ||
                  asset.asset_data.posterUrl ||
                  asset.asset_data.bannerUrl ||
                  (asset.asset_data.episodes &&
                    asset.asset_data.episodes[0]?.thumbnailUrl) ||
                  "https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=100&h=100&fit=crop",
              }}
              className="w-16 h-16 rounded-lg"
              resizeMode="cover"
            />
            {/* Content type indicator */}
            <View className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-1">
              {asset.content_type === "video" ? (
                <Play size={12} color="white" fill="white" />
              ) : (
                <Film size={12} color="white" />
              )}
            </View>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-white font-medium text-base">
              {asset.asset_data.title || asset.asset_data.name || "Untitled"}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              <Text className="text-blue-400 font-medium">
                {asset.content_type === "video" ? "Video" : "Series"}
              </Text>
              {asset.content_type === "series" &&
                (asset.asset_data.total_episodes
                  ? ` • ${asset.asset_data.total_episodes} episodes`
                  : asset.asset_data.episodes
                    ? ` • ${asset.asset_data.episodes.length} episodes`
                    : "")}
              {"\n"}Purchase on {formatDate(asset.granted_at)}
              {asset.asset_data.created_by && (
                <Text className="text-gray-500 text-xs">
                  {"\n"}by @{asset.asset_data.created_by.username}
                </Text>
              )}
            </Text>
          </View>
          <TouchableOpacity
            className="p-2"
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering the asset click
              setActiveDropdown(
                activeDropdown === asset._id ? null : asset._id
              );
            }}
          >
            <MoreVertical size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>

      {/* Dropdown Menu */}
      {activeDropdown === asset._id && (
        <View
          className="absolute right-4 top-16 rounded-lg border border-gray-700 z-10 min-w-32"
          style={{ backgroundColor: "#6B7280" }}
        >
          <TouchableOpacity
            className="px-4 py-3"
            onPress={() => handleRemoveAccess(asset._id, "asset")}
            disabled={isRemoving === asset._id}
          >
            <Text style={{ color: "#FFFFFF" }} className="font-medium">
              {isRemoving === asset._id ? "Removing..." : "Remove"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const handleCreatorClick = (creatorPass: CreatorPass) => {
    try {
      // Navigate to creator's public profile page
      router.push({
        pathname: "/(dashboard)/profile/public/[id]",
        params: {
          id: creatorPass.creator_id._id,
          username: creatorPass.creator_id.username,
        },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to open creator profile");
    }
  };

  const renderCreatorPassItem = (creatorPass: CreatorPass) => (
    <TouchableOpacity
      key={creatorPass._id}
      onPress={() => handleCreatorClick(creatorPass)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={["#000000", "#0a0a0a", "#1a1a1a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row items-center p-4 rounded-lg mb-3"
      >
        <View className="relative">
          <Image
            source={{
              uri:
                getProfilePhotoUrl(creatorPass.creator_id.profile_photo, "user"),
            }}
            className="w-16 h-16 rounded-full"
            resizeMode="cover"
          />
          {/* Creator indicator */}
          <View className="absolute -top-1 -right-1 bg-green-600 rounded-full p-1">
            <User size={12} color="white" />
          </View>
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-white font-semibold text-lg">
            {creatorPass.creator_id.username}
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            <Text className="text-green-400 font-medium">Creator Pass</Text>
            {"\n"}Access till {formatDate(creatorPass.end_date)}
          </Text>
        </View>
        {/* <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering the creator click
            handleRemoveAccess(creatorPass._id, "creator_pass");
          }}
          disabled={isRemoving === creatorPass._id}
          className="px-2 py-1 rounded-lg border border-white"
          style={{
            backgroundColor: "transparent",
            borderColor: "#FFFFFF",
            borderWidth: 1,
          }}
        >
          <Text className="text-white font-medium text-sm">
            {isRemoving === creatorPass._id ? "Removing..." : "Remove"}
          </Text>
        </TouchableOpacity> */}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex:1 , backgroundColor: "black" }} edges={[]}>
      <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">
          Purchased Access
        </Text>
        <View className="w-8" />
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mb-6">
        {renderTabButton("content", "Content")}
        {renderTabButton("series", "Series")}
        {renderTabButton("creator", "Creator")}
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setActiveDropdown(null)}
          className="flex-1"
        >
          {isLoading ? (
            <View className="flex-1 items-center justify-center mt-20">
              <ActivityIndicator size="large" color="#F1C40F" />
              <Text className="text-gray-400 mt-4">
                Loading your purchases...
              </Text>
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center mt-20 px-4">
              <Text className="text-red-400 text-center mb-4">
                Failed to load purchased access
              </Text>
              <Text className="text-gray-400 text-center text-sm mb-4">
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => window.location.reload()}
                className="bg-blue-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            (() => {
              const filteredData = getFilteredData();

              return filteredData.length > 0 ? (
                filteredData.map((item: any) =>
                  activeTab === "creator"
                    ? renderCreatorPassItem(item)
                    : renderAssetItem(item)
                )
              ) : (
                <View className="flex-1 items-center justify-center mt-20 px-4">
                  <View className="items-center">
                    {activeTab === "content" && (
                      <Play size={48} color="#6B7280" />
                    )}
                    {activeTab === "series" && (
                      <Film size={48} color="#6B7280" />
                    )}
                    {activeTab === "creator" && (
                      <User size={48} color="#6B7280" />
                    )}
                    <Text className="text-gray-400 text-center mt-4 text-lg">
                      No purchased {activeTab} found
                    </Text>
                    <Text className="text-gray-500 text-center mt-2 text-sm">
                      {activeTab === "content" &&
                        "Purchase individual videos to see them here"}
                      {activeTab === "series" &&
                        "Purchase series to see them here"}
                      {activeTab === "creator" &&
                        "Purchase creator passes to see them here"}
                    </Text>
                  </View>
                </View>
              );
            })()
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}
