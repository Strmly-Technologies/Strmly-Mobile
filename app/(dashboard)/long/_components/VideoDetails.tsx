import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  ChevronDownIcon,
  Hash,
  PlusSquare,
  SquareCheck,
} from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
import { router } from "expo-router";

type VideoDetailsProps = {
  videoId: string;
  name: string;
  type: string;
  is_monetized: boolean;
  videoAmount: number;
  createdBy?: {
    _id: string;
    username: string;
    profile_photo: string;
  };

  community: {
    _id: string;
    name: string;
  } | null;

  series: {
    _id: string;
    title: string;
    type: string;
    price: number;
    total_episodes: number;
    episodes: [];
  } | null;

  episode_number: number | null;
  onToggleFullScreen?: () => void;
  isFullScreen?: boolean;
};

const VideoDetails = ({
  videoId,
  type,
  is_monetized,
  name,
  videoAmount,
  series,
  episode_number,
  createdBy,
  community,
  onToggleFullScreen,
  isFullScreen,
}: VideoDetailsProps) => {
  const [screenIconEffect, setScreenIconEffect] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [isFollowCreator, setIsFollowCreator] = useState<boolean>(false);
  const [isFollowCreatorLoading, setIsFollowCreatorLoading] =
    useState<boolean>(false);
  const [isFollowCommunity, setIsFollowCommunity] = useState<boolean>(false);
  const [isFollowCommunityLoading, setIsFollowCommunityLoading] =
    useState<boolean>(false);

  const { token, user } = useAuthStore();

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  useEffect(() => {
    if (episode_number) setSelectedEpisodeIndex(episode_number);
  }, [episode_number]);

  useEffect(() => {
    const checkIfFollowCommunity = async () => {
      if (!token || !community?._id) {
        return;
      }

      try {
        const response = await fetch(
          `${BACKEND_API_URL}/community/${community?._id}/following-status`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok)
          throw new Error("Failed while checking community follow status");
        const data = await response.json();
        // console.log("check follow community", data);
        setIsFollowCommunity(data.status);
      } catch (err) {
        console.log("Error in community check status", err);
      }
    };

    if (token && community?._id) {
      checkIfFollowCommunity();
    }
  }, [token, community?._id]);

  const followCreator = async () => {
    setIsFollowCreatorLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/user/${!isFollowCreator ? "follow" : "unfollow"}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            !isFollowCreator
              ? {
                  followUserId: createdBy?._id,
                }
              : { unfollowUserId: createdBy?._id }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to follow user profile");
      }

      console.log("following data", data);
      setIsFollowCreator(data.isFollowing);

      Alert.alert(
        isFollowCreator
          ? "You unFollowed this creator"
          : "You are now Following this creator"
      );
    } catch (error) {
      console.log("error", error);

      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "An unknown error occurred while following user."
      );
    } finally {
      setIsFollowCreatorLoading(false);
    }
  };

  const followCommunity = async () => {
    if (!token || !community?._id) {
      return;
    }
    console.log(community, isFollowCommunity);
    setIsFollowCommunityLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/${isFollowCommunity ? "caution/community/unfollow" : "community/follow"}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ communityId: community._id }),
        }
      );
      if (!response.ok) throw new Error("Failed to follow community");
      const data = await response.json();
      setIsFollowCommunity(!isFollowCommunity);
      console.log("data", data);
    } catch (err) {
      console.log("err", err);

    } finally {
      setIsFollowCommunityLoading(false);
    }
  };

  return (
    <View className="w-full gap-3.5">
      {/* Top tags */}
      
      <View className="flex-row items-center justify-start gap-2">
        {community && (
          <>
            <Pressable
              onPress={() =>
                router.push(`/(dashboard)/communities/public/${community._id}`)
              }
            >
              <View className="items-center flex-row gap-0.5">
                <Hash color={"white"} size={14} fontWeight={800} />
                <Text className="text-white font-semibold">
                  {community.name}
                </Text>
              </View>
            </Pressable>
            <Pressable onPress={() => followCommunity()}>
              {isFollowCommunityLoading ? (
                <ActivityIndicator className="size-5" color="white" />
              ) : isFollowCommunity ? (
                <SquareCheck className="size-6" />
              ) : (
                <Image
                  source={require("../../../../assets/images/plus.png")}
                  className="size-5"
                />
              )}
            </Pressable>
          </>
        )}
      </View>

      {/* Username + Paid */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Pressable
            className="flex-row items-center gap-2"
            onPress={() => router.push(`/profile/public/${createdBy?._id}`)}
          >
            <Image
              source={
                createdBy?.profile_photo !== ""
                  ? {
                      uri: createdBy?.profile_photo,
                    }
                  : require("../../../../assets/images/user.png")
              }
              className="size-8 rounded-full"
            />
            <Text className="text-white font-semibold">
              {createdBy ? createdBy.username : ""}
            </Text>
          </Pressable>
          <TouchableOpacity
            disabled={isFollowCreatorLoading}
            onPress={() => followCreator()}
            className="border border-white items-center justify-center rounded-md px-2"
          >
            {isFollowCreatorLoading ? (
              <ActivityIndicator className="size-5" color="white" />
            ) : (
              <Text className="font-semibold text-sm text-white">
                {isFollowCreator ? "Following" : "Follow"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {type !== "Free" && (
          <View>
            <TouchableOpacity
              onPress={() => {
                setShowPriceDropdown((prev) => !prev);
                setShowDropdown(false);
              }}
              className="border border-white rounded-md px-2"
            >
              <Text className="font-semibold text-sm text-white">Paid</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Episode + Fullscreen */}
      <View className="flex-row items-center justify-between relative">
        <View className="flex-row items-center gap-1">
          <Text className="text-white uppercase">{name}</Text>
          {series !== null && (
            <TouchableOpacity
              className="border border-white rounded-xl px-2 py-0.5"
              onPress={() => {
                setShowDropdown((prev) => !prev);
                setShowPriceDropdown(false);
              }}
            >
              <View className="flex-row items-center">
                <Text className="font-semibold text-xs text-white mr-1">
                  Ep: 0{selectedEpisodeIndex}
                </Text>
                <ChevronDownIcon color={"white"} size={12} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <Pressable onPress={onToggleFullScreen}>
          <Image
            source={require("../../../../assets/images/fullscreen.png")}
            className={`size-5 ${isFullScreen ? "scale-110" : "scale-100"} ease-in`}
          />
        </Pressable>

        {/* Paid Dropdown */}
        {showPriceDropdown && (
          <View className="absolute bottom-14 -right-2 rounded-xl p-2 w-80">
            {series != null ? (
              <TouchableOpacity
                className="mb-0.5"
                onPress={() => {
                  setShowPriceDropdown(false);
                  setShowDropdown(false);
                }}
              >
                <Pressable
                  onPress={() => router.push("/(demo)/CreatorPassDemo")}
                >
                  <View
                    className={`bg-black h-11 px-2 py-1 flex-row items-center justify-between rounded-t-xl`}
                  >
                    <Text className="text-white text-[16px] flex-row items-center">
                      Creator Pass
                    </Text>
                    <Text className="text-white text-[16px]">
                      ₹{series?.price}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => router.push("/(demo)/SeriesAccessDemo")}
                >
                  <View
                    className={`bg-black h-11 px-2 py-1 flex-row items-center justify-between rounded-b-xl`}
                  >
                    <Text className="text-white text-[16px] flex-row items-center">
                      Content access
                    </Text>
                    <Text className="text-white text-[16px]">
                      ₹{videoAmount}
                    </Text>
                  </View>
                </Pressable>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="mb-0.5"
                onPress={() => {
                  setShowPriceDropdown(false);
                  setShowDropdown(false);
                }}
              >
                <Pressable
                  onPress={() =>
                    router.push(

                      series === null || series?.type === "Free"
                        ? "/(demo)/CreatorPassDemo"
                        : "/(demo)/SeriesAccessDemo"

                    )
                  }
                >
                  <View
                    className={`bg-black h-11 px-2 py-1 flex-row items-center justify-between rounded-t-xl`}
                  >
                    {series === null || series?.type === "Free" ? (
                      <>
                        <Text className="text-white text-[16px] flex-row items-center">
                          Creator Pass
                        </Text>
                        <Text className="text-white text-[16px]">
                          ₹{videoAmount}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text className="text-white text-[16px] flex-row items-center">
                          Content access
                        </Text>
                        <Text className="text-white text-[16px]">
                          ₹{series?.price}
                        </Text>
                      </>
                    )}
                  </View>
                </Pressable>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Episode Dropdown */}
        {showDropdown && (
          <View className="absolute bottom-3.5 left-11 rounded-xl p-2 w-56">
            {series?.episodes.map((ep, idx) => (
              <TouchableOpacity
                key={idx}
                className="mb-[0.5px]"
                onPress={() => {
                  setSelectedEpisodeIndex(idx);
                  setShowDropdown(false);
                }}
              >
                <View
                  className={`bg-black px-2 py-2 flex-row items-center ${
                    idx == 0 && "rounded-t-xl"
                  } ${idx == series.total_episodes - 1 && "rounded-b-xl"} ${selectedEpisodeIndex === idx && "gap-2"}`}
                >
                  <Text className="text-white text-[18px] flex-row items-center">
                    Episode: {idx + 1}
                  </Text>
                  {selectedEpisodeIndex === idx + 1 && (
                    <Text className="text-white pl-5">✔</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default VideoDetails;
