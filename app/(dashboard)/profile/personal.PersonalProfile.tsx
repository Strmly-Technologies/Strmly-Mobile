import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
  FlatList,
  BackHandler,
  Pressable, // For opening external links
} from "react-native";
import { CONFIG } from "@/Constants/config";
import { HeartIcon, MoreVertical, PaperclipIcon } from "lucide-react-native";

import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "@/store/useAuthStore";
import { getProfilePhotoUrl } from "@/utils/profileUtils";

import ProfileTopbar from "@/components/profileTopbar";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVideosStore } from "@/store/useVideosStore";
import VideoGridSkeleton from "@/components/VideoGridSkeleton";

export default function PersonalProfilePage() {
  const [activeTab, setActiveTab] = useState("videos");
  const [userData, setUserData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);

  const [isLoadingSeries, setIsLoadingSeries] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [showVideoMenu, setShowVideoMenu] = useState(false);
  const [selectedVideoMenu, setSelectedVideoMenu] = useState<string | null>(
    null
  );

  const { token, user } = useAuthStore();
  const { setVideosInZustand, appendVideos } = useVideosStore();

  const router = useRouter();

  // Derive logged-in state from token
  const isLoggedIn = !!token;

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  useFocusEffect(
    useCallback(() => {
      if (!token || !isLoggedIn) {
        router.replace("/(auth)/Sign-up");
        return;
      }
    }, [token, isLoggedIn])
  );

  // Refresh profile data when auth store user changes (e.g., after profile update)
  useEffect(() => {
    if (
      user?.profile_photo &&
      userData &&
      user.profile_photo !== userData.profile_photo
    ) {
      console.log(
        "🔄 Auth store profile photo changed, refreshing profile data"
      );
      // Update userData with the new profile photo from auth store
      setUserData((prev: any) =>
        prev ? { ...prev, profile_photo: user.profile_photo } : prev
      );
    }
  }, [user?.profile_photo, userData?.profile_photo]);

  const fetchUserVideos = async (pageToFetch: number, force = false) => {
    if (isRefreshing) {
      console.log("refreshing videos");
    } else if (!token || isLoadingVideos || (!hasMore && !force)) return;

    if (pageToFetch === 1) setIsLoadingVideos(true);
    console.log("fetching...");

    try {
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/user/videos?type=${activeTab}&page=${pageToFetch}`,
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

      if (pageToFetch === 1) {
        setVideos(data.videos); // first page → replace
      } else {
        setVideos((prev) => [...prev, ...data.videos]); // next pages → append
        appendVideos(data.videos); // also append to global store
      }

      if (data.videos.length === 0) {
        setHasMore(false); // stop when no more videos
      }

      setPage(pageToFetch);
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

  useEffect(() => {
    if (!token) return;
    console.log("activeTab", activeTab);
    if (activeTab === "repost") {
      userReshareVideos();
      return;
    } else if (activeTab === "series") {
      console.log("📺 Fetching series...");
      fetchUserSeries();
      return;
    }

    setVideos([]);
    setPage(1);
    setHasMore(true);
    fetchUserVideos(1, true);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${CONFIG.API_BASE_URL}/user/profile`, {
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

          console.log("Fetched fresh user data:", data.user);
          console.log(
            "Profile counts - Followers:",
            data.user.totalFollowers,
            "Following:",
            data.user.totalFollowing,
            "Communities:",
            data.user.totalCommunities
          );
          setUserData(data.user);
          setIsError(null);
        } catch (error) {
          console.log("error", error);
          setIsError(
            error instanceof Error
              ? error.message
              : "An unknown error occurred."
          );
          Alert.alert(
            "Error",
            error instanceof Error
              ? error.message
              : "An unknown error occurred."
          );
        } finally {
          setIsLoading(false);
        }
      };

      if (token) {
        fetchUserData();
      }
    }, [router, token])
  );

  const userReshareVideos = async () => {
    if (!token && activeTab !== "repost") return;

    try {
      const response = await fetch(`${BACKEND_API_URL}/user/reshares`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user reshare videos");
      }

      setVideos(data.enriched_reshares);
      // console.log("reshare videos", data.enriched_reshares.length);
    } catch (error) {
      console.log(error);
      // Alert.alert(
      //   "Error",
      //   error instanceof Error
      //     ? error.message
      //     : "An unknown error occurred while fetching user reshare videos."
      // );
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const fetchUserSeries = useCallback(async () => {
    if (!token || isLoadingSeries) return;

    setIsLoadingSeries(true);

    try {
      const url = `${CONFIG.API_BASE_URL}/series/user?t=${Date.now()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });

      console.log("📊 Response Debug Info:");
      console.log("  - Status:", response.status);
      console.log("  - Status Text:", response.statusText);

      if (!response.ok) {
        // Handle the specific case where user has no series (backend returns 404 instead of 200)
        if (response.status === 404) {
          try {
            const errorData = await response.json();
            console.log("❌ Error response data:", errorData);

            // If the error message indicates no series found, treat it as success with empty array
            if (errorData.error === "No series found for this user") {
              console.log("✅ No series found - treating as empty result");
              setSeries([]);
              return; // Exit early, don't throw error
            }
          } catch (parseError) {
            console.log("❌ Could not parse 404 error response as JSON");
          }
        }

        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Failed to fetch user series"
        );
      }

      const data = await response.json();
      console.log("✅ Raw API response:", data);

      // Handle case where data.data might be undefined or not an array
      if (!data.data || !Array.isArray(data.data)) {
        console.log("⚠️ Invalid data structure, treating as empty array");
        setSeries([]);
        return;
      }

      // Transform series data - only show first episode of each series in grid
      const firstEpisodes: any[] = [];

      data.data.forEach((seriesItem: any) => {
        // Only include series that have episodes
        if (seriesItem.episodes && seriesItem.episodes.length > 0) {
          console.log(
            "📺 Series:",
            seriesItem.title,
            "Episodes:",
            seriesItem.episodes.length
          );

          // Only take the first episode for grid display
          const firstEpisode = seriesItem.episodes[0];
          console.log("🎬 First episode data:", {
            name: firstEpisode.name,
            duration: firstEpisode.duration,
            videoUrl: firstEpisode.videoUrl,
            thumbnailUrl: firstEpisode.thumbnailUrl,
          });

          firstEpisodes.push({
            ...firstEpisode,
            seriesId: seriesItem._id,
            seriesTitle: seriesItem.title,
            seriesGenre: seriesItem.genre,
            seriesType: seriesItem.type,
            episodeIndex: 0, // Always 0 since it's the first episode
            totalEpisodesInSeries: seriesItem.episodes.length,
            allSeriesEpisodes: seriesItem.episodes, // Store all episodes for navigation
            // Ensure video URL is properly set
            videoUrl: firstEpisode.videoUrl || firstEpisode.video_url,
            // Add required access structure for VideoPlayer compatibility
            access: {
              isPurchased: seriesItem.access?.isPurchased || true, // Use series access or default to true
              isPlayable: seriesItem.access?.isPlayable || true,
              accessType: seriesItem.access?.accessType || "free",
              freeRange: seriesItem.access?.freeRange || null,
              price: seriesItem.price || 0,
            },
            hasCreatorPassOfVideoOwner:
              seriesItem.hasCreatorPassOfVideoOwner || false,
            // Ensure other required properties exist
            likes: firstEpisode.likes || 0,
            shares: firstEpisode.shares || 0,
            views: firstEpisode.views || 0,
            gifts: firstEpisode.gifts || 0,
            // Add missing properties for VideoProgressBar compatibility
            duration:
              firstEpisode.duration || firstEpisode.video_duration || 120, // Default to 2 minutes if no duration
            name: firstEpisode.name || `Episode 1`,
            amount: firstEpisode.amount || seriesItem.price || 0,
            // Ensure created_by structure exists
            created_by: firstEpisode.created_by ||
              seriesItem.created_by || {
                _id: "unknown",
                username: "Unknown",
                profile_photo: "",
              },
            // Add series reference for VideoProgressBar
            series: {
              _id: seriesItem._id,
              title: seriesItem.title,
              price: seriesItem.price || 0,
              total_episodes: seriesItem.episodes.length,
              episodes: seriesItem.episodes.map((ep: any, idx: number) => ({
                _id: ep._id,
                episode_number: idx + 1,
                name: ep.name || `Episode ${idx + 1}`,
              })),
            },
          });
        }
      });

      console.log(
        "📊 Transformed first episodes data:",
        firstEpisodes.length,
        "series with first episodes"
      );
      setSeries(firstEpisodes);
    } catch (err) {
      console.error("Error fetching user series:", err);
      // Don't show alert for "no series found" case
      if (err instanceof Error && !err.message.includes("No series found")) {
        Alert.alert(
          "Error",
          err.message || "An unknown error occurred while fetching series."
        );
      }
    } finally {
      setIsLoadingSeries(false);
    }
  }, [token, isLoadingSeries]);

  const handleDeleteUserVideo = async (videoId: string) => {
    console.log("delete video id", videoId, hasMore, isRefreshing);
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/caution/video/long/${videoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId: videoId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user video");
      }
      Alert.alert("Success", "Video deleted successfully");
      console.log("delete response videos", data);
      fetchUserVideos(1).finally(() => setIsRefreshing(false)); // Refresh videos after deletion
    } catch (error) {
      console.log(error);
    }
  };

  const renderGridItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      className="relative aspect-[9/16] flex-1 rounded-sm overflow-hidden"
      onPress={() => {
        setVideosInZustand(videos);
        router.push({
          pathname: "/(dashboard)/long/GlobalVideoPlayer",
          params: { startIndex: index.toString() },
        });

        console.log("item", item);
      }}
    >
      {item.thumbnailUrl !== "" ? (
        <Image
          source={{
            uri: `${item.thumbnailUrl}`,
          }}
          alt="video thumbnail"
          className="w-full h-full object-cover"
        />
      ) : (
        <View className="w-full h-full flex items-center justify-center">
          <Text className="text-white text-xs">Loading...</Text>
        </View>
      )}

      <Pressable
        onPress={() => {
          setSelectedVideoMenu(item._id);
          setShowVideoMenu((prev) => !prev);
        }}
        className="bg-white bg-opacity-50 rounded-full p-1 absolute top-2 right-2"
      >
        <MoreVertical className="bg-black" size={10} />
      </Pressable>

      {selectedVideoMenu === item._id && showVideoMenu && (
        <View className="absolute top-8 right-2 bg-white rounded-md shadow-md px-2 py-1">
          <Pressable
            onPress={() => {
              setIsRefreshing(true);
              handleDeleteUserVideo(item._id);
            }}
            className="px-3"
          >
            <Text className="text-red-500 text-sm">Delete</Text>
          </Pressable>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={["top"]}>
      {/* <ThemedView className="flex-1"> */}

      {/* Video Grid */}
      <FlatList
        data={activeTab === "series" ? series : videos}
        keyExtractor={(item) => item._id}
        renderItem={renderGridItem}
        numColumns={3}
        contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 0 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        onEndReached={() => fetchUserVideos(page + 1)}
        onEndReachedThreshold={0.8}
        ListHeaderComponent={
          <>
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
                  <View className="relative">
                    <Image
                      source={{
                        uri: getProfilePhotoUrl(
                          userData?.profile_photo,
                          "user"
                        ),
                      }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        borderWidth: 2,
                        borderColor: "white",
                        resizeMode: "cover",
                      }}
                    />

                    <View className="flex flex-row gap-2 items-center justify-center mt-2">
                      <Text className="text-gray-400">
                        @{userData?.username}
                      </Text>
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
                    onPress={() =>
                      router.push({
                        pathname: "/(dashboard)/profile/ProfileSections",
                        params: {
                          section: "followers",
                          userName: userData?.username || "Username",
                        },
                      })
                    }
                  >
                    <Text className="font-bold text-lg text-white">
                      {userData?.followers.length || 0}
                    </Text>
                    <Text className="text-gray-400 text-md">Followers</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex flex-col gap-1 items-center"
                    onPress={() =>
                      router.push({
                        pathname: "/(dashboard)/profile/ProfileSections",
                        params: {
                          section: "myCommunity",
                          userName: userData?.username || "User",
                        },
                      })
                    }
                  >
                    <Text className="font-bold text-lg text-white">
                      {userData?.community.length || 0}
                    </Text>
                    <Text className="text-gray-400 text-md">Community</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex flex-col gap-1 items-center"
                    onPress={() =>
                      router.push({
                        pathname: "/(dashboard)/profile/ProfileSections",
                        params: {
                          section: "following",
                          userName: userData?.username || "User",
                        },
                      })
                    }
                  >
                    <Text className="font-bold text-lg text-white">
                      {userData?.following.length || 0}
                    </Text>
                    <Text className="text-gray-400 text-md">Followings</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex flex-row w-full items-center justify-center gap-2 mt-5">
                  {/* My Community Button */}
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/(dashboard)/profile/ProfileSections",
                        params: {
                          section: "myCommunity",
                          userName: userData?.username || "User",
                        },
                      })
                    }
                    className="px-4 py-2 rounded-lg border border-white"
                  >
                    <Text className="text-white text-center font-bold">
                      My Community
                    </Text>
                  </TouchableOpacity>

                  {/* Dashboard Button (Gradient Border) */}
                  <TouchableOpacity
                    onPress={() =>
                      router.push("/(dashboard)/profile/Dashboard")
                    }
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
                <View className="my-6 flex flex-col items-center justify-center px-4">
                  <Text className="text-gray-400 text-center text-sm">
                    {userData?.bio}
                  </Text>
                </View>
              </View>
            )}

            {/* Tabs */}
            <View className="mt-0 border-b border-gray-700">
              <View className="flex-1 flex-row justify-around items-center">
                <TouchableOpacity
                  className={`pb-4 flex-1 items-center justify-center`}
                  onPress={() => setActiveTab("videos")}
                >
                  <Image
                    source={require("../../../assets/images/logo.png")}
                    style={{
                      width: 24,
                      height: 24,
                      opacity: activeTab === "videos" ? 1 : 0.5,
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    className={`text-sm mt-1 ${activeTab === "videos" ? "text-white" : "text-gray-400"}`}
                  >
                    Videos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`pb-4 flex-1 items-center justify-center`}
                  onPress={() => setActiveTab("series")}
                >
                  <Image
                    source={require("../../../assets/episode.png")}
                    style={{
                      width: 24,
                      height: 24,
                      opacity: activeTab === "series" ? 1 : 0.5,
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    className={`text-sm mt-1 ${activeTab === "series" ? "text-white" : "text-gray-400"}`}
                  >
                    Series
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {(isLoadingVideos ||
              isLoadingSeries) && (
                // Show skeleton when loading OR when we haven't initially loaded yet
                <VideoGridSkeleton />
              )}

            {activeTab === "videos"
              ? videos.length === 0 &&
                !isLoadingVideos && (
                  <View className="items-center justify-center px-4 py-20">
                    <Image
                      source={require("../../../assets/images/logo.png")}
                      style={{ width: 48, height: 48, opacity: 0.5 }}
                      resizeMode="contain"
                    />
                    <Text className="text-white text-xl text-center mt-2">
                      No videos found
                    </Text>
                    <Text className="text-gray-400 text-center mt-1">
                      Upload your first video to get started
                    </Text>
                  </View>
                )
              : activeTab === "series" &&
                series.length === 0 &&
                !isLoadingSeries && (
                  <View className="items-center justify-center px-4 py-20">
                    <Image
                      source={require("../../../assets/episode.png")}
                      style={{ width: 48, height: 48 }}
                      resizeMode="contain"
                    />
                    <Text className="text-white text-xl text-center mt-2">
                      No episodes found
                    </Text>
                    <Text className="text-gray-400 text-center mt-1">
                      Create your first series to get started
                    </Text>
                  </View>
                )}
          </>
        }
      />
      {/* </ThemedView> */}
    </SafeAreaView>
  );
}
