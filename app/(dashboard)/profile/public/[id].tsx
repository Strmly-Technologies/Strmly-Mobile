import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  FlatList,
  Dimensions,
} from "react-native";
import {
  LinkIcon,
  HeartIcon,
  IndianRupee,
  PaperclipIcon,
} from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import ThemedView from "@/components/ThemedView"; // Assuming this is a basic wrapper for styling
import ProfileTopbar from "@/components/profileTopbar"; // Assuming this is the converted ProfileTopbar
import { LinearGradient } from "expo-linear-gradient"; // For the gradient border
import Constants from "expo-constants";
import { useRoute } from "@react-navigation/native";
import { router, useFocusEffect } from "expo-router";
import { getProfilePhotoUrl } from "@/utils/profileUtils";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVideosStore } from "@/store/useVideosStore";
import { set } from "lodash";
import VideoGridSkeleton from "@/components/VideoGridSkeleton";
import CONFIG from "@/Constants/config";

const { height } = Dimensions.get("window");

export default function PublicProfilePageWithId() {
  const [activeTab, setActiveTab] = useState("videos");
  const [userData, setUserData] = useState<any>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [communities, setCommunities] = useState<any[]>([]);

  const [videos, setVideos] = useState<any[]>([]);

  const [series, setSeries] = useState<any[]>([]);

  const [isLoadingSeries, setIsLoadingSeries] = useState<boolean>(false);

  const [hasCreatorPass, setHasCreatorPass] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [following, setFollowing] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [page, setPage] = useState(1);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { token } = useAuthStore();
  const { setVideosInZustand, appendVideos } = useVideosStore();

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  const route = useRoute();
  const { id } = route.params as { id: string };

  const fetchUserVideos = useCallback(
    async (pageToFetch: number) => {
      if (!token || !id || isLoadingVideos || !hasMore) return;
      setIsLoadingVideos(true);

      try {
        console.log(`Fetching videos for user ${id}`);
        const response = await fetch(
          `${BACKEND_API_URL}/user/videos/${id}?type=${activeTab}&page=${pageToFetch}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user videos");
        }

        if (data.videos.length === 0) {
          setHasMore(false); // no more pages
          return;
        }

        if (pageToFetch === 1) {
          setVideos(data.videos); // replace
          // setVideosInZustand(data.videos);
        } else {
          setVideos((prev) => [...prev, ...data.videos]); // append
          appendVideos(data.videos);
        }
        setPage(pageToFetch); // update page
      } catch (err) {
        console.error("Error fetching user videos:", err);
        Alert.alert("Error", "Unable to fetch videos.");
      } finally {
        setIsLoadingVideos(false);
      }
    },
    [token, id, activeTab, isLoadingVideos, hasMore]
  );

  // Reset videos when tab changes
  useEffect(() => {
    if (!id || activeTab === "repost" || activeTab === "liked") return;
    if (activeTab === "series") {
      console.log("📺 Fetching series...");
      // fetchUserSeries();
      return;
    }

    setVideos(() => []);
    setPage(1);
    setHasMore(true);
    fetchUserVideos(1); // fetch first page
  }, [id, token]);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;

      const fetchUserData = async () => {
        try {
          const response = await fetch(
            `${BACKEND_API_URL}/user/profile/${id}`,
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
            throw new Error(data.message || "Failed to fetch user profile");
          }

          setUserData(data.user);
          setIsFollowing(data.user?.isBeingFollowed);
          setFollowing(data.user.totalFollowers);
          console.log("Pubic User data", data.user);
          setUserError(null);
          if (data.user?.tags && data.user.tags.length > 2) setShowMore(true);

          // Set communities from user data
          if (data.user?.userDetails?.my_communities) {
            console.log(
              "Setting communities:",
              data.user.userDetails.my_communities
            );
            setCommunities(data.user.userDetails.my_communities);
          } else {
            console.log("No communities found in user data");
            setCommunities([]);
          }
        } catch (error) {
          console.log(error);
          setUserError(
            error instanceof Error
              ? error.message
              : "An unknown error occurred while fetching user data."
          );
          Alert.alert("An unknown error occurred.");
          // Alert.alert(
          //   "Error",
          //   error instanceof Error
          //     ? error.message
          //     : "An unknown error occurred while fetching user data."
          // );
        } finally {
          setIsLoading(false);
        }
      };

      if (token && id) {
        fetchUserData();
      }
    }, [token, id, router])
  );

  const fetchUserLikedVideos = async () => {
    setIsLoadingVideos(true);
    setVideos([]); // Clear previous videos
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/user/profile/${id}/liked-videos`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user liked videos");
      }

      setVideos(data.data);
      setVideosInZustand(data.data);
      console.log("Liked videos", data.data);
    } catch (err) {
      console.error("Error fetching user liked videos:", err);
      Alert.alert("An unknown error occurred.");
      // Alert.alert(
      //   "Error",
      //   err instanceof Error
      //     ? err.message
      //     : "An unknown error occurred while fetching videos."
      // );
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const fetchUserReshareVideos = async () => {
    if (!id && !token && activeTab !== "repost") return;

    try {
      const response = await fetch(`${BACKEND_API_URL}/user/reshares/${id}`, {
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
      setVideosInZustand(data.enriched_reshares);
      console.log("reshare videos", data.enriched_reshares);
    } catch (error) {
      console.log(error);
      // Alert.alert("An unknown error occurred.");
      // Alert.alert(
      //   "Error",
      //   error instanceof Error
      //     ? error.message
      //     : "An unknown error occurred while fetching user reshare videos."
      // );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSeries = useCallback(async () => {
    if (!token || isLoadingSeries || !userData) return;

    setIsLoadingSeries(true);

    console.log("user details:", userData?.userDetails);
    try {
      console.log("🔍 fetchUserSeries Debug Info:");
      console.log("  - API Base URL:", CONFIG.API_BASE_URL);
      console.log("  - Token exists:", !!token);

      const url = `${CONFIG.API_BASE_URL}/series/user/${userData?.userDetails?._id}}`;
      console.log("  - Full URL:", url);

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
  }, [token, isLoadingSeries, userData]);

  const followCreator = async () => {
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/user/${!isFollowing ? "follow" : "unfollow"}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            !isFollowing
              ? {
                  followUserId: id,
                }
              : { unfollowUserId: id }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to follow user profile");
      }

      console.log(data);
      setIsFollowing(data.isFollowing);
      setFollowing(data.user.followers);
      // Alert.alert(
      //   isFollowing
      //     ? "You unFollowed this creator"
      //     : "You are now Following this creator"
      // );
    } catch (error: { message: string } | any) {
      console.log(error);
      Alert.alert(error.message || "An unknown error occurred.");
      // Alert.alert(
      //   "Error",
      //   error instanceof Error
      //     ? error.message
      //     : "An unknown error occurred while following user."
      // );
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const hasCreatorPass = async () => {
        try {
          const response = await fetch(
            `${BACKEND_API_URL}/user/has-creator-pass/${id}`,
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
            throw new Error(
              data.message || "Failed to fetch user creator pass"
            );
          }

          console.log("has Creator pass", data);
          setHasCreatorPass(data.hasCreatorPass);
        } catch (error) {
          console.log(error);
          Alert.alert("An unknown error occurred.");
          // Alert.alert(
          //   "Error",
          //   error instanceof Error
          //     ? error.message
          //     : "An unknown error occurred while following user."
          // );
        } finally {
          setIsLoading(false);
        }
      };

      if (id && token) {
        hasCreatorPass();
      }
    }, [id, token])
  );

  const openLink = (url: string) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url; // default to https
    }
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  const renderGridItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      className="relative aspect-[9/16] flex-1 rounded-sm overflow-hidden"
      onPress={() => {
        setVideosInZustand(videos);
        console.log("index:", index);
        router.push({
          pathname: "/(dashboard)/long/GlobalVideoPlayer",
          params: { startIndex: index },
        });
      }}
    >
      {item.thumbnailUrl !== "" ? (
        <Image
          source={{ uri: item.thumbnailUrl }}
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={["top"]}>
      <ThemedView style={{ flex: 1 }}>
        <FlatList
          data={activeTab === "videos" ? videos : series}
          keyExtractor={(item) => item._id}
          renderItem={renderGridItem}
          numColumns={3}
          contentContainerStyle={{
            paddingBottom: 30,
            paddingHorizontal: 0,
          }}
          onEndReached={() => fetchUserVideos(page + 1)}
          onEndReachedThreshold={0.8}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {userError !== null ? (
                <View className="h-full w-full items-center justify-center">
                  <Text className="text-white text-xl">
                    No such user exists
                  </Text>
                </View>
              ) : (
                <View className="flex-1 gap-5">
                  {!isLoading && (
                    <View className="h-48 relative">
                      <ProfileTopbar
                        hashtag={false}
                        isMore={false}
                        name={userData?.userDetails?.username}
                      />
                    </View>
                  )}

                  {/* Profile Info */}
                  {isLoading ? (
                    <View className="w-full h-96 flex items-center justify-center -mt-20 relative">
                      <ActivityIndicator size="large" color="#F1C40F" />
                    </View>
                  ) : (
                    <View className="max-w-4xl -mt-32 relative mx-6">
                      <View className="flex flex-col items-center md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                        <View className="items-center">
                          <View className="size-24 border-white border rounded-full overflow-hidden">
                            <Image
                              source={{
                                uri: getProfilePhotoUrl(
                                  userData?.userDetails?.profile_photo,
                                  "user"
                                ),
                              }}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </View>

                          <View className="flex flex-row gap-2 items-center justify-center mt-2">
                            <Text className="text-gray-400">
                              @{userData?.userDetails?.username}
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
                      <View
                        className={`mt-6 flex-row items-center ${userData?.userDetails?.creator_profile?.creator_pass_price !== 0 && !hasCreatorPass ? "justify-evenly gap-4" : "justify-center gap-5"}`}
                      >
                        <TouchableOpacity
                          className="text-center items-center"
                          // onPress={() => router.push("/communities?type=followers")}
                        >
                          <Text className="font-semibold text-lg text-white">
                            {following}
                          </Text>
                          <Text className="text-gray-400 text-md font-thin">
                            Followers
                          </Text>
                        </TouchableOpacity>

                        {/* Follow Button */}
                        <TouchableOpacity
                          onPress={() => followCreator()}
                          className="h-9 px-7 py-2 rounded-lg border border-white"
                        >
                          <Text className="text-white text-center font-semibold">
                            {isFollowing ? "Following" : "Follow"}
                          </Text>
                        </TouchableOpacity>

                        {/* Access Button with Gradient Border */}
                        {userData?.userDetails?.creator_profile
                          ?.creator_pass_price !== 0 && !hasCreatorPass ? (
                          <TouchableOpacity
                            onPress={() =>
                              router.push({
                                pathname:
                                  "/(dashboard)/PurchasePass/PurchaseCreatorPass/[id]",
                                params: { id: userData?.userDetails._id },
                              })
                            }
                            className={`h-10 rounded-lg overflow-hidden`}
                          >
                            <LinearGradient
                              colors={[
                                "#4400FFA6",
                                "#FFFFFF",
                                "#FF00004D",
                                "#FFFFFF",
                              ]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              className="p-[1px] rounded-lg flex-1"
                            >
                              <View
                                className={`flex-1 px-2 rounded-lg bg-black items-center justify-center`}
                              >
                                <View className="flex-row items-center justify-center">
                                  <Text className="text-white text-center">
                                    Access at
                                  </Text>
                                  <IndianRupee color={"white"} size={13} />
                                  <Text className="text-white text-center ml-0.5">
                                    {
                                      userData?.userDetails?.creator_profile
                                        ?.creator_pass_price
                                    }
                                    /month
                                  </Text>
                                </View>
                              </View>
                            </LinearGradient>
                          </TouchableOpacity>
                        ) : userData?.userDetails?.creator_profile
                            .creator_pass_price !== 0 ? (
                          <TouchableOpacity
                            className={`h-10 rounded-lg overflow-hidden`}
                          >
                            <LinearGradient
                              colors={[
                                "#4400FFA6",
                                "#FFFFFF",
                                "#FF00004D",
                                "#FFFFFF",
                              ]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              className="p-[1px] rounded-lg flex-1"
                            >
                              <View
                                className={`flex-1 px-4 rounded-lg bg-black items-center justify-center`}
                              >
                                <View className="flex-row items-center justify-center">
                                  <Text className="text-white text-center">
                                    Joined
                                  </Text>
                                </View>
                              </View>
                            </LinearGradient>
                          </TouchableOpacity>
                        ) : (
                          <></>
                        )}
                      </View>

                      {/* Social Media Links - Moved here to replace hashtags */}
                      {userData?.userDetails?.social_media_links &&
                        Object.values(
                          userData.userDetails.social_media_links
                        ).some((link) => link) && (
                          <View className="mt-5 flex-row justify-center gap-8 flex-wrap">
                            {userData.userDetails.social_media_links
                              .snapchat && (
                              <TouchableOpacity
                                onPress={() =>
                                  openLink(
                                    userData.userDetails.social_media_links
                                      .snapchat
                                  )
                                }
                                className="w-10 h-10 rounded-lg overflow-hidden"
                                style={{ backgroundColor: "#FFFC00" }}
                              >
                                <Image
                                  source={require("../../../../assets/images/snapchat.png")}
                                />
                              </TouchableOpacity>
                            )}
                            {userData.userDetails.social_media_links
                              .instagram && (
                              <TouchableOpacity
                                onPress={() =>
                                  openLink(
                                    userData.userDetails.social_media_links
                                      .instagram
                                  )
                                }
                              >
                                <Image
                                  source={require("../../../../assets/images/insta.png")}
                                  className="size-10"
                                />
                              </TouchableOpacity>
                            )}
                            {userData.userDetails.social_media_links
                              .youtube && (
                              <TouchableOpacity
                                onPress={() =>
                                  openLink(
                                    userData.userDetails.social_media_links
                                      .youtube
                                  )
                                }
                              >
                                <Image
                                  source={require("../../../../assets/images/yt.png")}
                                  className="size-10"
                                />
                              </TouchableOpacity>
                            )}
                            {userData.userDetails.social_media_links
                              .facebook && (
                              <TouchableOpacity
                                onPress={() =>
                                  openLink(
                                    userData.userDetails.social_media_links
                                      .facebook
                                  )
                                }
                                className="w-10 h-10 rounded-lg overflow-hidden"
                                style={{ backgroundColor: "#1877F2" }}
                              >
                                <View className="w-full h-full items-center justify-center">
                                  <Text className="text-white text-lg font-bold">
                                    f
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            )}
                            {userData.userDetails.social_media_links
                              .twitter && (
                              <TouchableOpacity
                                onPress={() =>
                                  openLink(
                                    userData.userDetails.social_media_links
                                      .twitter
                                  )
                                }
                                className="w-10 border border-gray-800 h-10 rounded-lg overflow-hidden"
                                style={{ backgroundColor: "#000000" }}
                              >
                                <View className="w-full h-full items-center justify-center">
                                  <Text className="text-white text-lg font-bold">
                                    𝕏
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}

                      {/* Bio - Moved below social media links with larger font */}
                      <View className="mt-4 flex flex-col items-center justify-center px-4">
                        {userData?.userDetails?.bio && (
                          <Text className="text-gray-400 text-sm text-center">
                            {userData?.userDetails?.bio}
                          </Text>
                        )}
                        {userData?.website && (
                          <View className="mt-2 flex flex-row flex-wrap gap-4 text-gray-400 justify-center">
                            <TouchableOpacity
                              onPress={() => Linking.openURL(userData.website)}
                              className="flex-row items-center"
                            >
                              <LinkIcon className="w-4 h-4 mr-1 text-white" />
                              <Text className="text-white underline">
                                {userData.website}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>

                      {/* Communities as Hashtags */}
                      {/* {communities.length > 0 && (
                        <View className="flex flex-row flex-wrap w-full items-center justify-center gap-2 mt-3">
                          {communities.slice(0, 2).map((community) => (
                            <TouchableOpacity
                              key={community._id}
                              onPress={() => {
                                router.push({
                                  pathname:
                                    "/(dashboard)/communities/public/[id]",
                                  params: { id: community._id },
                                });
                              }}
                              className="px-4 py-2 border border-gray-400 rounded-[8px]"
                            >
                              <Text className="text-white">
                                #{community.name}
                              </Text>
                            </TouchableOpacity>
                          ))}

                          {communities.length > 2 && (
                            <TouchableOpacity
                              onPress={() => {
                                router.push({
                                  pathname:
                                    "/(dashboard)/profile/ProfileSections",
                                  params: {
                                    section: "myCommunity",
                                    userName: userData?.username,
                                  },
                                });
                              }}
                              className="px-4 py-2 border border-gray-400 rounded-[8px]"
                            >
                              <Text className="text-white">More</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )} */}
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
                          source={require("../../../../assets/images/logo.png")}
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
                          source={require("../../../../assets/episode.png")}
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

                  {/* {isLoadingVideos ? (
                    // Show skeleton when loading OR when we haven't initially loaded yet
                    <VideoGridSkeleton />
                  ) : activeTab === "videos" ? (
                    videos.length === 0 &&
                    !isLoadingVideos && (
                      <View className="items-center justify-center px-4 py-20">
                        <Image
                          source={require("../../../../assets/images/logo.png")}
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
                  ) : (
                    activeTab === "series" &&
                    series.length === 0 &&
                    !isLoadingSeries && (
                      <View className="items-center justify-center px-4 py-20">
                        <Image
                          source={require("../../../../assets/episode.png")}
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
                    )
                  )} */}
                </View>
              )}
            </>
          }
          ListFooterComponent={
            isLoadingVideos || isLoadingSeries ? (
              // Show skeleton when loading OR when we haven't initially loaded yet
              <VideoGridSkeleton />
            ) : null
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}
