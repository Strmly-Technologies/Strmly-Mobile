import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Image } from "expo-image"; // For optimized image handling
import { IndianRupee, HeartIcon, VideoIcon, PaperclipIcon } from "lucide-react-native"; // React Native Lucide icons
import { useAuthStore } from "@/store/useAuthStore";
import { useLocalSearchParams, useRouter } from "expo-router"; // Expo Router for navigation
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator";
import ThemedView from "@/components/ThemedView";
import ProfileTopbar from "@/components/profileTopbar";
import { LinearGradient } from 'expo-linear-gradient';

const profileData = {
  id: 1,
  name: "Tech Entrepreneurs",
  description: "A community for tech entrepreneurs to share ideas and network",
  image: "https://via.placeholder.com/60", // Replaced with a direct URL for placeholder
  banner: "https://via.placeholder.com/400x200", // Replaced with a direct URL for placeholder
  followers: 12500,
  creators: 12500,
  videos: 1250,
  category: "Business",
  isPrivate: false,
  isJoined: true,
  communityFee: 30,
  role: "member",
  tags: ["startup", "technology", "business"],
  owner: {
    name: "John Doe",
    avatar: "https://via.placeholder.com/32", // Replaced with a direct URL for placeholder
  },
};

export default function PublicCommunityPage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [communityData, setCommunityData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const { user, isLoggedIn, token, logout } = useAuthStore();
  const router = useRouter();
  const params = useLocalSearchParams(); // Use useLocalSearchParams for route parameters

  const { id } = params; // Get id from params

  const thumbnails = useThumbnailsGenerate(
    videos.map((video) => ({
      id: video._id,
      url: video.videoUrl,
    }))
  );

  useEffect(() => {
    // if (!isLoggedIn) {
    //   router.push("/login"); // Use router.push for navigation in Expo Router
    //   return;
    // }

    const fetchUserVideos = async () => {
      setIsLoadingVideos(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("type", activeTab);

        // Adjust API endpoint to include community ID if videos are community-specific
        // Assuming your backend expects a communityId for video fetching
        const response = await fetch(
          `/api/communities/${id}/video-by-id?${queryParams.toString()}`, // Modified URL
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch community videos");
        }

        console.log("videos", data);
        setVideos(data); // Assuming data is directly the array of videos

        // If your API returns a different structure, you might need to transform it:
        // const transformedVideos = data.map((video: any) => ({
        //   _id: video._id,
        //   title: video.title,
        //   description: video.description || "",
        //   thumbnail: video.thumbnailUrl || "/placeholder.svg",
        //   likes: video.likesCount || 0,
        //   views: video.viewsCount || 0,
        //   createdAt: video.createdAt,
        // }));
        // setVideos(transformedVideos);
      } catch (err) {
        console.error("Error fetching community videos:", err);
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

    if (token && id) {
      // Ensure id is available for fetching videos
      fetchUserVideos();
    }
  }, [isLoggedIn, activeTab, router, token, id]); // Add 'id' to dependency array

  useEffect(() => {
    // if (!isLoggedIn) {
    //   router.push("/login");
    //   return;
    // }

    const fetchCommunityData = async () => {
      try {
        const response = await fetch(`/api/communities/by-id?id=${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          // credentials: "include" is not directly applicable in React Native fetch for cookies like in web
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch community profile");
        }

        console.log(data);
        setCommunityData(data);
      } catch (error) {
        console.log(error);
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "An unknown error occurred while fetching community data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token && id) {
      // Ensure id is available
      fetchCommunityData();
    }
  }, [isLoggedIn, router, id, token]);

  return (
    <ThemedView className="flex-1 pt-5">
      {/* Cover Image */}
      {!isLoading && (
        <View className="h-48 relative">
          <ProfileTopbar
            hashtag={true}
            name={communityData?.name || profileData.name}
          />
        </View>
      )}

      {isLoading ? (
        <View className="w-full flex items-center justify-center -mt-20 relative">
          <ActivityIndicator size="large" color="#F1C40F" />
        </View>
      ) : (
        <View className="max-w-4xl -mt-28 relative mx-6">
          <View className="flex flex-col items-center md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <View className="relative flex flex-col items-center w-full">
              {/* Replaced Avatar with Image for simplicity, you can create a custom Avatar component */}
              <View className="size-24 rounded-full border border-white overflow-hidden">
                <Image
                  source={{
                    uri: communityData?.profile_photo || profileData.image,
                  }}
                  className="w-full h-full object-cover rounded-full"
                  contentFit="cover"
                />
              </View>
              <View className="flex flex-row items-center justify-center w-full mt-2">
                <Text className="text-gray-400">
                  By @
                  {communityData?.founder?.username || profileData.owner.name}
                </Text>
                {profileData.isPrivate && (
                  <Text className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Private
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Stats */}
          <View className="mt-6 flex flex-row justify-around items-center">
            <TouchableOpacity
              className="flex flex-col gap-1 items-center"
              onPress={() => setActiveTab("followers")}
            >
              <Text className="font-bold text-lg text-white">
                {communityData?.followers?.length || 0}
              </Text>
              <Text className="text-gray-400 text-md">Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex flex-col gap-1 items-center"
              onPress={() => setActiveTab("following")}
            >
              <Text className="font-bold text-lg text-white">
                {communityData?.creators?.length || 0}
              </Text>
              <Text className="text-gray-400 text-md">Creators</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex flex-col gap-1 items-center"
              onPress={() => setActiveTab("posts")}
            >
              <Text className="font-bold text-lg text-white">
                {communityData?.total_uploads || 0}
              </Text>
              <Text className="text-gray-400 text-md">Videos</Text>
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View className="flex flex-row w-full items-center justify-center gap-2 mt-5 md:mt-0">
            <TouchableOpacity className="flex-1 px-4 py-2 rounded-xl bg-transparent border border-gray-400">
              <Text className="text-white text-center">Follow</Text>
            </TouchableOpacity>

            <TouchableOpacity className="rounded-xl overflow-hidden">
              <LinearGradient
                colors={["#4400FFA6", "#FFFFFF", "#FF00004D", "#FFFFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-[1px] rounded-xl flex-1"
              >
                <View className="flex-1 px-4 py-2 rounded-xl bg-black items-center justify-center">
                  {communityData?.community_fee_type === "free" ? (
                    <Text className="text-white text-center">Free</Text>
                  ) : (
                    <View className="flex-row items-center justify-center">
                      <Text className="text-white">Join at</Text>
                      <Text><IndianRupee color={"white"} size={13} /></Text>
                      <Text className="text-white text-center">
                        {communityData?.community_fee_amount || profileData.communityFee}/month
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bio */}
          <View className="mt-6 flex flex-col items-center justify-center px-4">
            <Text className="text-gray-400 text-xs text-center">
              {communityData?.bio || profileData.description}
            </Text>
          </View>

          {/* Tabs */}
          <View className="mt-6 border-b border-gray-700">
            <View className="flex flex-row justify-around items-center">
              <TouchableOpacity
                className={`pb-4 flex-1 items-center justify-center`}
                onPress={() => setActiveTab("long")}
              >
                <PaperclipIcon
                  color={activeTab === "long" ? "white" : "gray"}
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
        </View>
      )}

      {isLoadingVideos ? (
        <View className="w-full h-96 flex items-center justify-center mt-20">
          <ActivityIndicator size="large" color="#F1C40F" />
        </View>
      ) : (
        <>
          {activeTab === "clips" ? (
            <View className="flex flex-col gap-2 mt-4 px-6">
              {videos.map((video) => (
                <TouchableOpacity
                  key={video._id}
                  className="w-full h-[100svh] sm:h-[90vh] relative rounded-lg overflow-hidden bg-black"
                >
                  {thumbnails[video._id] ? (
                    <Image
                      source={{ uri: thumbnails[video._id] }}
                      alt="video thumbnail"
                      className="w-full h-full object-cover"
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-full h-full flex items-center justify-center text-white text-xs">
                      <Text className="text-white text-xs">Loading...</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2 px-6">
              {videos.map((video) => (
                <TouchableOpacity
                  key={video._id}
                  className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black"
                >
                  {thumbnails[video._id] ? (
                    <Image
                      source={{ uri: thumbnails[video._id] }}
                      alt="video thumbnail"
                      className="w-full h-full object-cover"
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-full h-full flex items-center justify-center text-white text-xs">
                      <Text className="text-white text-xs">Loading...</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
    </ThemedView>
  );
}
