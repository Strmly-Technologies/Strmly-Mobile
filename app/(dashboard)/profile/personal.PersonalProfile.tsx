import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
  Image,
  FlatList, // For opening external links
} from "react-native";
import { CONFIG } from "@/Constants/config";
import {
  MapPin,
  LinkIcon,
  Calendar,
  VideoIcon, // Replaces PlayIcon for video tab
  HeartIcon,
  BookmarkIcon,
  IndianRupee,
  Video,
  PaperclipIcon, // For the gradient button
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router"; // Use useRouter from expo-router
import { useAuthStore } from "@/store/useAuthStore";
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator";
import ThemedView from "@/components/ThemedView"; // Assuming this is a basic wrapper for styling
import ProfileTopbar from "@/components/profileTopbar"; // Assuming this is the converted ProfileTopbar
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";

// Note: testVideos, api, toast, and format are not directly used in the final render
// but if `api` or `toast` are custom internal modules, ensure they are RN compatible.
// `format` (from date-fns) is compatible with React Native.

export default function PersonalProfilePage() {
  const [activeTab, setActiveTab] = useState("long"); // Default to 'clips' as in original
  const [userData, setUserData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false); // Keep true initially to show loader

  const [isError, setIsError] = useState<string | null>(null);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const { isLoggedIn, token } = useAuthStore();
  const router = useRouter();

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  const thumbnails = useThumbnailsGenerate(
    videos.map((video) => ({
      id: video._id,
      url: video.videoUrl,
    }))
  );

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/(auth)/Sign-in");
      return;
    }

    const fetchUserVideos = async (page = 1) => {

      if (activeTab == "repost") return;

      setIsLoadingVideos(true);
      try {
        const response = await fetch(
          // Assuming your API server is accessible from the Expo client
          `${BACKEND_API_URL}/user/videos?type=${activeTab}&page=${page}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user videos");
        }

        setVideos(data.videos);
      } catch (err) {
        console.error("Error fetching user videos:", err);
        Alert.alert(
          "Error",
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching videos."
        );
      } finally {
        setIsLoadingVideos(false);
      }
    };

    if (token) {
      fetchUserVideos();
    }
  }, [isLoggedIn, router, token, activeTab]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/(auth)/Sign-in");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${BACKEND_API_URL}/user/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user profile");
        }

        setUserData(data.user);
        setIsError(null);
      } catch (error) {
        console.log("error", error);
        setIsError(
          error instanceof Error ? error.message : "An unknown error occurred."
        );
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "An unknown error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [isLoggedIn, router, token]);

  const userReshareVideos = async () => {

    if (!userData._id && !token && activeTab !== "repost") return;

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/user/reshares/${userData._id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );


      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user reshare videos");
      }

      setVideos(data.reshares);
      console.log("reshare videos", data);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching user reshare videos."
      );
    } finally {
      setIsLoading(false);

    }
  };

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity className="relative aspect-[9/16] flex-1 rounded-sm overflow-hidden">
      {activeTab === "repost" ? (
        item?.long_video?.thumbnailUrl !== "" ? (
          <Image
            source={{ uri: item?.long_video?.thumbnailUrl }}
            alt="video thumbnail"
            className="w-full h-full object-cover"
          />
        ) : thumbnails[item?.long_video._id] ? (
          <Image
            source={{ uri: thumbnails[item?.long_video?._id] }}
            alt="video thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <View className="w-full h-full flex items-center justify-center">
            <Text className="text-white text-xs">Loading...</Text>
          </View>
        )
      ) : item.thumbnailUrl !== "" ? (
        <Image
          source={{ uri: item.thumbnailUrl }}
          alt="video thumbnail"
          className="w-full h-full object-cover"
        />
      ) : thumbnails[item._id] ? (
        <Image
          source={{ uri: thumbnails[item._id] }}
          alt="video thumbnail"
          className="w-full h-full object-cover"
        />
      ) : (
        <View className="w-full h-full flex items-center justify-center">
          <Text className="text-white text-xs">Loading...</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView className="flex-1 pt-6">
      <ScrollView className="flex-1">
        {!isLoading && (
          <View className="h-48 relative">
            <ProfileTopbar hashtag={false} name={userData?.username} />
          </View>
        )}

        {/* Profile Info */}
        {isLoading ? (
          <View className="w-full h-96 flex items-center justify-center -mt-20 relative">
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center h-60 -mt-20">
            <Text className="text-white text-center">
              Sorry, it looks like an error occurred:{" "}
              {typeof isError === "string" ? isError : "Unknown error"}
            </Text>
          </View>
        ) : (
          <View className="max-w-4xl -mt-28 relative mx-6">
            <View className="flex flex-col items-center md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
              <View className="relative items-center">
                <View className="size-24 rounded-full border overflow-hidden">
                  <Image
                    source={
                      userData?.profile_photo
                        ? {
                            uri: userData?.profile_photo,
                          }
                        : require("../../../assets/images/user.png")
                    }
                    className="w-full h-full object-cover rounded-full"
                  />
                </View>

                <View className="flex flex-row gap-2 items-center justify-center mt-2">
                  <Text className="text-gray-400">@{userData?.username}</Text>
                  {userData?.creator_profile?.verification_status ===
                    "verified" && (
                    <Text className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                      Verified
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Stats */}
            <View className="mt-6 flex-row justify-around items-center">
              <TouchableOpacity
                className="flex flex-col gap-1 items-center"
                // onPress={() => router.push("/communities?type=followers")}
              >
                <Text className="font-bold text-lg text-white">
                  {userData?.followers.length}
                </Text>
                <Text className="text-gray-400 text-md">Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-col gap-1 items-center"
                // onPress={() => router.push("/communities?type=community")}
              >
                <Text className="font-bold text-lg text-white">
                  {userData?.community.length}
                </Text>
                <Text className="text-gray-400 text-md">Community</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-col gap-1 items-center"
                // onPress={() => router.push("/communities?type=following")}
              >
                <Text className="font-bold text-lg text-white">
                  {userData?.following.length}
                </Text>
                <Text className="text-gray-400 text-md">Followings</Text>
              </TouchableOpacity>
            </View>

            <View className="flex flex-row w-full items-center justify-center gap-2 mt-5">
              {/* My Community Button */}
              <TouchableOpacity
                onPress={() => router.push("/(communities)/CommunitiesPage")}
                className="px-4 py-2 rounded-lg border border-white"
              >
                <Text className="text-white text-center font-bold">
                  My Community
                </Text>
              </TouchableOpacity>

              {/* Dashboard Button (Gradient Border) */}
              <TouchableOpacity
                onPress={() => router.push("/(dashboard)/profile/Dashboard")}
                className="px-4 py-2 rounded-lg border border-white" // Use rounded-md for consistency
              >
                <Text className="text-white text-center font-bold">
                  Dashboard
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-1 flex-row w-full items-center justify-center gap-2 mt-5">
              <TouchableOpacity
                onPress={() => router.push("/Profile/EditProfile")}
                className="px-4 py-2 border border-gray-400 rounded-lg"
              >
                <Text className="text-white text-center">Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(dashboard)/profile/History")}
                className="px-4 py-2 border border-gray-400 rounded-lg"
              >
                <Text className="text-white text-center">History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(dashboard)/profile/access")}
                className="rounded-lg overflow-hidden"
              >
                <LinearGradient
                  colors={["#4400FFA6", "#FFFFFF", "#FF00004D", "#FFFFFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-[1.5px] rounded-lg flex-1" // Use rounded-md here
                >
                  <View className="flex-1 px-4 py-2 rounded-lg bg-black items-center justify-center">
                    <Text className="text-white text-center font-bold">
                      Access
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Bio */}
            <View className="mt-6 flex flex-col items-center justify-center px-4">
              <Text className="text-gray-400 text-center text-xs">
                {userData?.bio}
              </Text>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View className="mt-6 border-b border-gray-700">
          <View className="flex-1 flex-row justify-around items-center">
            <TouchableOpacity
              className={`pb-4 flex-1 items-center justify-center`}
              onPress={() => setActiveTab("long")}
            >
              <PaperclipIcon color={activeTab === "long" ? "white" : "gray"} />
            </TouchableOpacity>

            <TouchableOpacity
              className={`pb-4 flex-1 items-center justify-center`}
              onPress={() => {
                userReshareVideos();
                setActiveTab("repost");
              }}
            >
              <Image
                source={require("../../../assets/images/repost.png")}
                className={`size-7 ${activeTab === "repost" ? "text-white font-semibold" : " opacity-55"}`}
              />
            </TouchableOpacity>

            <TouchableOpacity
              className={`pb-4 flex-1 items-center justify-center`}
              onPress={() => setActiveTab("liked")}
            >
              <HeartIcon
                color={activeTab === "liked" ? "white" : "gray"}
                fill={activeTab === "liked" ? "white" : ""}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Video Grid */}
        {isLoadingVideos ? (
          <View className="w-full h-96 flex-1 items-center justify-center mt-20">
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <FlatList
            data={videos}
            keyExtractor={(item) => item._id}
            renderItem={renderGridItem}
            numColumns={3}
            contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 0 }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          />
        )}
      </ScrollView>
    </ThemedView>
  );
}
