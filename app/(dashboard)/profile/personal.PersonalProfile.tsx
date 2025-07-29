import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
  Image, // For opening external links
} from "react-native";
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
import { useRouter } from "expo-router"; // Use useRouter from expo-router
import { useAuthStore } from "@/store/useAuthStore";
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator"; // Ensure this path is correct
import ThemedView from "@/components/ThemedView"; // Assuming this is a basic wrapper for styling
import ProfileTopbar from "@/components/profileTopbar"; // Assuming this is the converted ProfileTopbar
import { LinearGradient } from "expo-linear-gradient";

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
  const { user, isLoggedIn, token, logout } = useAuthStore();
  const router = useRouter();

  const thumbnails = useThumbnailsGenerate(
    videos.map((video) => ({
      id: video._id,
      url: video.videoUrl,
    }))
  );

  useEffect(() => {
    // if (!isLoggedIn) {
    //   router.push("/login");
    //   return;
    // }

    const fetchUserVideos = async () => {
      setIsLoadingVideos(true);
      try {
        const params = new URLSearchParams();
        params.append("type", activeTab);

        const response = await fetch(
          // Assuming your API server is accessible from the Expo client
          `/api/user/profile/videos?${params.toString()}`,
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

        console.log("videos", data);
        setVideos(data.videos); // Assuming data structure is { videos: [...] }
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
    // if (!isLoggedIn) {
    //   router.push("/login");
    //   return;
    // }

    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          // `credentials: "include"` is for browser cookies; not directly applicable here.
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user profile");
        }

        console.log(data.user);
        setUserData(data.user);
        setIsError(null); // Clear any previous errors
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

  const currentProfileData = {
    name: userData?.name || "User",
    email: userData?.email || "",
    image:
      userData?.avatar ||
      userData?.image ||
      "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    username: userData?.username || userData?.email?.split("@")[0] || "user",
    bio: userData?.bio || "Welcome to my profile! 👋",
    location: userData?.location || "Not specified",
    website: userData?.website || "",
    joinedDate: userData?.createdAt
      ? new Date(userData.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "N/A", // Ensure joinedDate is a string or 'N/A'
    coverImage:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=200&fit=crop",
    followers: userData?.stats?.followersCount || 0,
    following: userData?.stats?.followingCount || 0,
    posts: userData?.stats?.videosCount || 0,
    communityLength: userData?.community?.length || 0, // Added for clarity
    isVerified: userData?.isVerified || false,
  };

  return (
    <ThemedView className="flex-1 pt-5">
      <ScrollView className="flex-1">
        {/* Cover Image */}
        {!isLoading && (
          <View className="h-48 relative">
            <ProfileTopbar hashtag={false} name={currentProfileData.username} />
          </View>
        )}

        {/* Profile Info */}
        {isLoading ? (
          <View className="w-full h-96 flex items-center justify-center -mt-20 relative">
            <ActivityIndicator size="large" color="#F1C40F" />
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
              <View className="relative">
                <View className="size-24 rounded-full border border-white overflow-hidden">
                  <Image
                    source={{
                      uri: currentProfileData.image,
                    }}
                    className="w-full h-full object-cover rounded-full"
                  />
                </View>

                <View className="flex flex-row gap-2 items-center justify-center mt-2">
                  <Text className="text-gray-400">
                    @{currentProfileData.username}
                  </Text>
                  {(currentProfileData.isVerified ||
                    userData?.creator_profile?.verification_status ===
                      "verified") && (
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
                  {currentProfileData.followers}M
                </Text>
                <Text className="text-gray-400 text-md">Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-col gap-1 items-center"
                // onPress={() => router.push("/communities?type=community")}
              >
                <Text className="font-bold text-lg text-white">
                  {currentProfileData.communityLength}
                </Text>
                <Text className="text-gray-400 text-md">Community</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-col gap-1 items-center"
                // onPress={() => router.push("/communities?type=following")}
              >
                <Text className="font-bold text-lg text-white">
                  {currentProfileData.following}
                </Text>
                <Text className="text-gray-400 text-md">Followings</Text>
              </TouchableOpacity>
            </View>

            <View className="flex flex-row w-full items-center justify-center gap-2 mt-5">
              {/* My Community Button */}
              <TouchableOpacity
                // onPress={() => router.push("/communities")}
                className="px-4 py-2 rounded-lg border border-white"
              >
                <Text className="text-white text-center font-bold">
                  My Community
                </Text>
              </TouchableOpacity>

              {/* Dashboard Button (Gradient Border) */}
              <TouchableOpacity
                // onPress={() => router.push("/profile/dashboard")}
                className="rounded-lg overflow-hidden" // Use rounded-md for consistency
              >
                <Text className="text-white text-center font-bold">
                  Dashboard
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-1 flex-row w-full items-center justify-center gap-2 mt-5">
              <TouchableOpacity
                // onPress={() => router.push("/profile/edit")}
                className="px-4 py-2 border border-gray-400 rounded-lg"
              >
                <Text className="text-white text-center">Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 border border-gray-400 rounded-lg">
                <Text className="text-white text-center">History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                // onPress={() => router.push("/profile/dashboard")}
                className="rounded-lg overflow-hidden" // Use rounded-md for consistency
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
                {currentProfileData.bio}
              </Text>
              <View className="mt-2 flex flex-row flex-wrap gap-4 text-gray-400 justify-center">
                {currentProfileData.location !== "Not specified" && (
                  <View className="flex-row items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    <Text className="text-gray-400">
                      {currentProfileData.location}
                    </Text>
                  </View>
                )}
                {currentProfileData.website && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(currentProfileData.website)}
                    className="flex-row items-center"
                  >
                    <LinkIcon className="w-4 h-4 mr-1 text-white" />
                    <Text className="text-white underline">
                      {currentProfileData.website}
                    </Text>
                  </TouchableOpacity>
                )}
                {currentProfileData.joinedDate !== "N/A" && (
                  <View className="flex-row items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    <Text className="text-gray-400">
                      Joined {currentProfileData.joinedDate}
                    </Text>
                  </View>
                )}
              </View>
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
              onPress={() => setActiveTab("repost")}
            >
              <Image
                source={require("../../../assets/images/repost.png")}
                className={`size-7 ${activeTab === "repost" ? "text-white font-semibold" : "text-gray-800"}`}
              />
            </TouchableOpacity>

            <TouchableOpacity
              className={`pb-4 flex-1 items-center justify-center`}
              onPress={() => setActiveTab("likes")}
            >
              <HeartIcon
                color={"white"}
                fill={activeTab === "likes" ? "white" : ""}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Video Grid */}
        {isLoadingVideos ? (
          <View className="w-full h-96 flex-1 items-center justify-center mt-20">
            <ActivityIndicator size="large" color="#F1C40F" />
          </View>
        ) : (
          <View className="mt-4 flex flex-row flex-wrap justify-start px-6">
            {videos.map((video) => (
              <TouchableOpacity
                key={video._id}
                className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black w-[32.33%] m-[0.5%] border border-gray-700" // Calculate width for 3 columns with small gap
              >
                {thumbnails[video._id] ? (
                  <Image
                    source={{ uri: thumbnails[video._id] }}
                    alt="video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <View className="w-full h-full flex items-center justify-center">
                    <Text className="text-white text-xs">Loading...</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}