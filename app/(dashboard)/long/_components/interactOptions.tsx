import { Image, Pressable, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useGiftingStore } from "@/store/useGiftingStore";

type InteractOptionsProps = {
  onCommentPress?: () => void; // Callback function for comment button press - now optional
  videoId: string;
  name: string;
  likes: number;
  gifts: number;
  shares: number;
  comments?: number;

  creator: {
    _id: string;
    username: string;
    profile_photo: string;
  };

  // Callbacks to update parent component stats

  // Callbacks to update parent component stats
  onLikeUpdate?: (newLikeCount: number, isLiked: boolean) => void;
  onShareUpdate?: (newShareCount: number, isShared: boolean) => void;
  onGiftUpdate?: (newGiftCount: number) => void;
  onCommentUpdate?: (newCommentCount: number) => void;
};

const InteractOptions = ({
  onCommentPress,
  videoId,
  name,
  likes,
  gifts,
  shares,
  comments,
  creator,
  onCommentUpdate,
}: InteractOptionsProps) => {
  // Destructure onCommentPress from props
  const [like, setLike] = useState(0);
  const [reshares, setReshares] = useState(0);
  const [gift, setGifts] = useState(0);
  const [commentCount, setCommentCount] = useState(comments || 0);
  const [isLikedVideo, setIsLikedVideo] = useState(false);
  const [isResharedVideo, setIsResharedVideo] = useState(false);

  const { token, user } = useAuthStore();

  const { initiateGifting } = useGiftingStore();

  const BACKEND_API_URL = CONFIG.API_BASE_URL;

  // FIX: Update local state when props change
  useEffect(() => {
    setLike(likes || 0);
    setReshares(shares || 0);
    setGifts(gifts || 0);
    setCommentCount(comments || 0);
  }, [likes, shares, gifts, comments]);

  const LikeVideo = async () => {
    if (!token || !videoId) {
      return;
    }

    const prevLiked = isLikedVideo;
    const prevLikeCount = like;

    setLike(() => (prevLiked ? prevLikeCount - 1 : prevLikeCount + 1));
    setIsLikedVideo(() => !prevLiked);

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/interactions/${isLikedVideo ? "unlike" : "like"}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videoId: videoId }),
        }
      );
      if (!response.ok) {
        setLike(() => prevLikeCount);
        setIsLikedVideo(() => prevLiked);
        throw new Error("Failed while like video");
      }
      const data = await response.json();
      // setLike(data.likes);
      // setIsLikedVideo(data.isLiked);
      console.log("Like video", data);

      // Update parent component with new stats
      // if (onLikeUpdate) {
      //   onLikeUpdate(like, isLikedVideo);
      // }
    } catch (err) {
      console.log(err);
      setLike(() => prevLikeCount);
      setIsLikedVideo(() => prevLiked);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const checkIfVideoLike = async () => {
        if (!token || !videoId) {
          return;
        }

        try {
          console.log("checking like status for", token);
          const response = await fetch(
            `${BACKEND_API_URL}/interactions/like/status`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ videoId: videoId }),
            }
          );

          if (!response.ok)
            throw new Error("Failed while checking video like status");

          const data = await response.json();
          console.log("check like", data, creator.username, videoId, name);
          setLike(data.likes);
          setIsLikedVideo(data.isLiked);
        } catch (err) {
          console.log(err);
        }
      };

      if (token && videoId) {
        checkIfVideoLike();
      }
    }, [token, videoId, likes])
  );

  // Check video gifting
  useFocusEffect(
    useCallback(() => {
      const checkVideoGifting = async () => {
        if (!token || !videoId) {
          return;
        }

        try {
          const response = await fetch(
            `${BACKEND_API_URL}/videos/${videoId}/total-gifting`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok)
            throw new Error("Failed while checking video like status");
          const data = await response.json();
          console.log("check gifting", data);
          setGifts(data.data);

          // Update parent component with new gift count
          // if (onGiftUpdate) {
          //   onGiftUpdate(data.data);
          // }
        } catch (err) {
          console.log(err);
        }
      };

      if (token && videoId) {
        checkVideoGifting();
      }
    }, [token, videoId])
  );

  // ------------- Reshare ------------
  useEffect(() => setReshares(shares), [shares]);

  useEffect(() => {
    const checkIfReshare = async () => {
      if (!token || !videoId) {
        return;
      }

      try {
        const response = await fetch(
          `${BACKEND_API_URL}/interactions/reshare/status`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ videoId: videoId }),
          }
        );
        if (!response.ok)
          throw new Error("Failed while checking reshare status");
        const data = await response.json();
        console.log("reshared or not", data.isReshared);
        setIsResharedVideo(data.isReshared);
      } catch (err) {
        console.log(err);
      }
    };

    if (token && videoId) {
      checkIfReshare();
    }
  }, [token, videoId, shares]);

  const ReshareVideo = async () => {
    if (!token || !videoId) {
      console.log("videoId", token);
      return;
    }

    const prevReshareCount = reshares;
    const prevIsReshared = isResharedVideo;

    setReshares(() =>
      prevIsReshared ? prevReshareCount - 1 : prevReshareCount + 1
    );
    setIsResharedVideo(() => !prevIsReshared);

    try {
      const response = await fetch(`${BACKEND_API_URL}/interactions/reshare`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId: videoId }),
      });
      if (!response.ok) {
        setReshares(() => prevReshareCount);
        setIsResharedVideo(() => prevIsReshared);
        throw new Error("Failed to reshare video");
      }
      const data = await response.json();
      // setIsResharedVideo(!isResharedVideo);
      // setReshares(data.totalReshares);
      console.log("Reshare video", data);

      // Update parent component with new stats
      // if (onShareUpdate) {
      //   onShareUpdate(reshares, isResharedVideo);
      // }
    } catch (err) {
      setReshares(() => prevReshareCount);
      setIsResharedVideo(() => prevIsReshared);
      console.log(err);
    }
  };

  const openGifting = async () => {
    initiateGifting(creator, videoId);
    router.push("/(payments)/Video/Video-Gifting");
  };

  // FIX: Enhanced comment press handler
  const handleCommentPress = useCallback(() => {
    if (onCommentPress) {
      onCommentPress();
    } else {
      console.log("Comments not available");
    }
  }, [onCommentPress]);

  return (
    <View className="px-1 py-5">
      <View className="gap-5 py-10">
        <View className="items-center gap-1">
          <Pressable onPress={() => LikeVideo()}>
            <FontAwesome
              name={isLikedVideo ? "heart" : "heart-o"}
              size={27}
              color={isLikedVideo ? "red" : "white"}
            />
          </Pressable>

          <Text className="text-white text-sm">{like}</Text>
        </View>

        <View className="items-center gap-1">
          <Pressable onPress={handleCommentPress}>
            <Image
              className="size-7"
              source={require("../../../../assets/images/comments.png")}
            />
          </Pressable>
          <Text className="text-white text-sm">{commentCount}</Text>
        </View>

        {/* <View className="items-center gap-1">
          <Pressable onPress={ReshareVideo}>
            {isResharedVideo ? (
              <Image
                className="size-7"
                source={require("../../../../assets/images/reshare-green.png")}
              />
            ) : (
              <Image
                className="size-7"
                source={require("../../../../assets/images/repost.png")}
              />
            )}
          </Pressable>
          <Text className="text-white text-sm">{reshares}</Text>
        </View> */}

        <View className="items-center gap-1">
          <Pressable onPress={() => openGifting()}>
            <Image
              className="size-7"
              source={require("../../../../assets/images/rupee.png")}
            />
          </Pressable>
          <Text className="text-white text-sm">{gift}</Text>
        </View>
      </View>
    </View>
  );
};

export default InteractOptions;
