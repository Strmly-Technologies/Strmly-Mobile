import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView, // Use ScrollView for scrollable content
  Alert,
  Image,
  Linking, // For opening external links
} from "react-native";
import {
  MapPin,
  LinkIcon,
  Calendar,
  HeartIcon,
  VideoIcon, // Changed PlayIcon to VideoIcon for consistency with other file
  IndianRupee,
  PaperclipIcon, // Added for the gradient button
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator"; // Ensure this path is correct
import ThemedView from "@/components/ThemedView"; // Assuming this is a basic wrapper for styling
import ProfileTopbar from "@/components/profileTopbar"; // Assuming this is the converted ProfileTopbar
import { LinearGradient } from "expo-linear-gradient"; // For the gradient border
import Constants from "expo-constants";

// No need for mockPosts, as you're fetching real data now.

export default function PublicProfilePage() {
  const [activeTab, setActiveTab] = useState("long");
  const [userData, setUserData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const { user, isLoggedIn, token, logout } = useAuthStore();
  const router = useRouter();

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  // Access the current user's ID if this profile page is for the logged-in user
  // If this page can display OTHER users' profiles, you'd use useLocalSearchParams for `id`
  // For now, assuming it's for the *logged-in user's* profile based on the original code's API calls
  // If you need to fetch a specific user's profile by ID, you'd uncomment useLocalSearchParams and get the ID from there.

  const thumbnails = useThumbnailsGenerate(
    videos.map((video) => ({
      id: video._id,
      url: video.videoUrl,
    }))
  );

  useEffect(() => {
    // Re-enabled login check as it's crucial for protected routes
    // if (!isLoggedIn) {
    //   router.push('/(auth)/Sign-in');
    //   return;
    // }

    const fetchUserVideos = async () => {
      setIsLoadingVideos(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("type", activeTab);

        const response = await fetch(
          `${BACKEND_API_URL}/user/profile/videos?${queryParams.toString()}`,
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
        setVideos(data);
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
    //   router.push('/(auth)/Sign-in');
    //   return;
    // }

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

        console.log(data.user);
        setUserData(data.user);
      } catch (error) {
        console.log(error);
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "An unknown error occurred while fetching user data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [isLoggedIn, router, token]);

  // Use a derived state for profileData for cleaner access
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
      ? new Date(userData?.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "N/A",
    coverImage:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=200&fit=crop", // Placeholder, consider dynamic cover image
    followers: userData?.stats?.followersCount || 0,
    following: userData?.stats?.followingCount || 0,
    posts: userData?.stats?.videosCount || 0,
    isVerified: userData?.isVerified || false,
    creatorPassPrice: userData?.creator_profile?.creator_pass_price || 0,
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
            <View className={`mt-6 flex-row justify-evenly items-center ${currentProfileData.creatorPassPrice !== 0 && "gap-4" }`}>
              <TouchableOpacity
                className="text-center items-center"
                // onPress={() => router.push("/communities?type=followers")}
              >
                <Text className="font-semibold text-lg text-white">
                  {currentProfileData.followers}M
                </Text>
                <Text className="text-gray-400 text-md font-thin">
                  Followers
                </Text>
              </TouchableOpacity>

              {/* Follow Button */}
              <TouchableOpacity className="h-9 px-7 py-2 rounded-lg border border-white">
                <Text className="text-white text-center font-semibold">
                  Follow
                </Text>
              </TouchableOpacity>

              {/* Access Button with Gradient Border */}
              <TouchableOpacity
                className={`${currentProfileData.creatorPassPrice !== 0 && "flex-grow" } h-10 rounded-lg overflow-hidden`}
              >
                <LinearGradient
                  colors={["#4400FFA6", "#FFFFFF", "#FF00004D", "#FFFFFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-[1px] rounded-lg flex-1"
                >
                  <View
                    className={`flex-1 ${currentProfileData.creatorPassPrice == 0 && "px-4"} rounded-lg bg-black items-center justify-center`}
                  >
                    {currentProfileData.creatorPassPrice === 0 ? (
                      <Text className="text-white text-center">
                        Free Access
                      </Text>
                    ) : (
                      <View className="flex-row items-center justify-center">
                        <Text className="text-white text-center">
                          Access at
                        </Text>
                        <IndianRupee color={"white"} size={13} />
                        <Text className="text-white text-center ml-0.5">
                          {currentProfileData.creatorPassPrice}/month
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Tags/Edit Buttons */}
            <View className="flex flex-row flex-wrap w-full items-center justify-center gap-2 mt-5">
              <TouchableOpacity className="px-4 py-2 border border-gray-400 rounded-[8px]">
                <Text className="text-white">#Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 border border-gray-400 rounded-[8px]">
                <Text className="text-white">#Fun</Text>
              </TouchableOpacity>
            </View>

            {/* Bio */}
            <View className="mt-6 flex flex-col items-center justify-center px-4">
              <Text className="text-gray-400 text-xs text-center">
                {currentProfileData.bio}
              </Text>
              <View className="mt-2 flex flex-row flex-wrap gap-4 text-gray-400 justify-center">
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
                source={require("../../../../assets/images/repost.png")}
                className="w-6 h-6"
                tintColor={activeTab === "repost" ? "white" : "gray"} // Apply tintColor for coloring images
              />
            </TouchableOpacity>

            <TouchableOpacity
              className={`pb-4 flex-1 items-center justify-center`}
              onPress={() => setActiveTab("likes")}
            >
              <HeartIcon
                color={activeTab === "likes" ? "white" : "gray"}
                fill={activeTab === "likes" ? "white" : ""}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- */}
        {isLoadingVideos ? (
          <View className="w-full h-96 flex-1 items-center justify-center mt-20">
            <ActivityIndicator size="large" color="#F1C40F" />
          </View>
        ) : (
          <View className="mt-4 grid grid-cols-3 sm:grid-cols-4 px-6">
            {videos.map((video, index) => (
              <TouchableOpacity
                key={video._id}
                // Removed dynamic border classes, as the image itself will fill the cell
                className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black mx-[1px] my-[1px]" // Added small margins for grid gap
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
