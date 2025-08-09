import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  FlatList, // For opening external links
} from "react-native";
import { CONFIG } from "@/Constants/config";
import {
  LinkIcon,
  HeartIcon,
  IndianRupee,
  PaperclipIcon, // Added for the gradient button
} from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator"; // Ensure this path is correct
import ThemedView from "@/components/ThemedView"; // Assuming this is a basic wrapper for styling
import ProfileTopbar from "@/components/profileTopbar"; // Assuming this is the converted ProfileTopbar
import { LinearGradient } from "expo-linear-gradient"; // For the gradient border
import Constants from "expo-constants";
import { useRoute } from "@react-navigation/native";
import { router } from "expo-router";

export default function PublicProfilePageWithId() {
  const [activeTab, setActiveTab] = useState("long");
  const [userData, setUserData] = useState<any>(null);
  const [userError, setUserError] = useState<string | null>(null);

  const [videos, setVideos] = useState<any[]>([]);

  const [isFollowing, setIsFollowing] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const { token } = useAuthStore();

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  const route = useRoute();
  const { id } = route.params as { id: string };

  const thumbnails = useThumbnailsGenerate(
    useMemo(
      () =>
        videos.map((video) => ({
          id: video._id,
          url: video.videoUrl,
        })),
      [videos]
    )
  );

  useEffect(() => {
    if (!id) return;

    const fetchUserVideos = async (page = 1) => {

      if (activeTab == "repost") return;

      setIsLoadingVideos(true);
      try {
        const response = await fetch(
          `${BACKEND_API_URL}/user/videos/${id}?type=${activeTab}&page=${page}`,
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

    if (token && id) {
      fetchUserVideos();
    }
  }, [token, activeTab, id]);

  const userReshareVideos = async (page = 1) => {
    setIsLoadingVideos(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/user/reshares`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user videos");
      }

      setVideos(data.reshares);
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
    if (!id) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${BACKEND_API_URL}/user/profile/${id}`, {
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
        setIsFollowing(data.user?.isBeingFollowed);
        console.log("Pubic User data", data.user);
        setUserError(null);
        if (data.user?.tags && data.user.tags.length > 2) setShowMore(true);
      } catch (error) {
        console.log(error);
        setUserError(
          error instanceof Error
            ? error.message
            : "An unknown error occurred while fetching user data."
        );
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

    if (token && id) {
      fetchUserData();
    }
  }, [token, id]);

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
      Alert.alert(
        isFollowing
          ? "You unFollowed this creator"
          : "You are now Following this creator"
      );
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "An unknown error occurred while following user."
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
    <ThemedView className="flex-1">
      {userError !== null ? (
        <View className="h-full w-full items-center justify-center">
          <Text className="text-white text-xl">No such user exists</Text>
        </View>
      ) : (
        <View className="flex-1 pt-5 gap-5">
          {!isLoading && (
            <View className="h-48 relative">
              <ProfileTopbar
                hashtag={false}
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
            <View className="max-w-4xl -mt-28 relative mx-6">
              <View className="flex flex-col items-center md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                <View className="items-center">
                  <View className="size-24 border-white border rounded-full overflow-hidden">
                    <Image
                      source={
                        userData?.userDetails?.profile_photo
                          ? {
                              uri: userData.userDetails.profile_photo,
                            }
                          : require("../../../../assets/images/user.png")
                      }
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
                className={`mt-6 flex-row justify-evenly items-center ${userData?.userDetails?.creator_profile?.creator_pass_price !== 0 && "gap-4"}`}
              >
                <TouchableOpacity
                  className="text-center items-center"
                  // onPress={() => router.push("/communities?type=followers")}
                >
                  <Text className="font-semibold text-lg text-white">
                    {userData?.totalFollowers}
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
                {userData?.userDetails?.creator_profile?.creator_pass_price !==
                  0 && (
                  <TouchableOpacity
                    onPress={() => router.push(`/(demo)/PurchaseCreatorPass/${userData?.userDetails._id}`)}
                    className={`${userData?.creatorPassPrice !== 0 && "flex-grow"} h-10 rounded-lg overflow-hidden`}
                  >

                    <LinearGradient
                      colors={["#4400FFA6", "#FFFFFF", "#FF00004D", "#FFFFFF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="p-[1px] rounded-lg flex-1"
                    >
                      <View
                        className={`flex-1 ${userData?.userDetails?.creator_profile?.creator_pass_price == 0 && "px-4"} rounded-lg bg-black items-center justify-center`}
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
                )}
              </View>

              {/* Tags/Edit Buttons */}
              {userData?.userDetails?.interests && (
                <View className="flex flex-row flex-wrap w-full items-center justify-center gap-2 mt-5">
                  {userData?.userDetails?.interests.map(
                    (tag: string, index: number) => {
                      if (index < 2) {
                        return (
                          <TouchableOpacity
                            key={tag}
                            className="px-4 py-2 border border-gray-400 rounded-[8px]"
                          >
                            <Text className="text-white">#{tag}</Text>
                          </TouchableOpacity>
                        );
                      }
                      if (!showMore && index > 2) {
                        return (
                          <TouchableOpacity
                            key={tag}
                            className="px-4 py-2 border border-gray-400 rounded-[8px]"
                          >
                            <Text className="text-white">#{tag}</Text>
                          </TouchableOpacity>
                        );
                      }
                    }
                  )}

                  {showMore && (
                    <Pressable onPress={() => setShowMore(false)}>
                      <TouchableOpacity className="px-4 py-2 border border-gray-400 rounded-[8px]">
                        <Text className="text-white">More</Text>
                      </TouchableOpacity>
                    </Pressable>
                  )}
                </View>
              )}

              {/* Bio */}
              <View className="mt-6 flex flex-col items-center justify-center px-4">
                <Text className="text-gray-400 text-xs text-center">
                  {userData?.userDetails?.bio}
                </Text>
                <View className="mt-2 flex flex-row flex-wrap gap-4 text-gray-400 justify-center">
                  {userData?.website && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(userData.website)}
                      className="flex-row items-center"
                    >
                      <LinkIcon className="w-4 h-4 mr-1 text-white" />
                      <Text className="text-white underline">
                        {userData.website}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {/* {currentProfileData.joinedDate !== "N/A" && (
                  <View className="items-center">
                    <Calendar className="text-gray-400" />
                    <Text className="text-gray-400">
                      Joined {currentProfileData.joinedDate}
                    </Text>
                  </View>
                )} */}
                </View>
              </View>
            </View>
          )}

          {/* Tabs */}
          <View className="mt-6">
            <View className="flex-1 flex-row justify-around items-center">
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
                onPress={() => {
                  fetchUserReshareVideos();
                  setActiveTab("repost");
                }}
              >
                <Image
                  source={require("../../../../assets/images/repost.png")}
                  className="w-6 h-6"
                  tintColor={activeTab === "repost" ? "white" : "gray"} // Apply tintColor for coloring images
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

          {isLoadingVideos ? (
            <View className="w-full h-96 flex-1 items-center justify-center mt-20">
              <ActivityIndicator size="large" color="white" />
            </View>
          ) : (
            <FlatList
              data={videos}
              keyExtractor={(item) => item._id}
              renderItem={renderGridItem}
              numColumns={3}
              contentContainerStyle={{
                paddingBottom: 30,
                paddingHorizontal: 0,
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </ThemedView>
  );
}
