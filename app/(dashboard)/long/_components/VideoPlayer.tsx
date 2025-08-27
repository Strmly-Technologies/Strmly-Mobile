import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Dimensions,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  usePlayerStore,
  setActivePlayer,
  clearActivePlayer,
} from "@/store/usePlayerStore";
import VideoControls from "./VideoControls";
import { VideoItemType } from "@/types/VideosType";
import CommentsSection from "./CommentSection";
import GiftingMessage from "./GiftingMessage";
import { router } from "expo-router";
import VideoProgressBar from "./VideoProgressBar";
import { useGiftingStore } from "@/store/useGiftingStore";
import SeriesPurchaseMessage from "./SeriesPurcchaseMessaage";
import CreatorPassBuyMessage from "./CreatorPassBuyMessage";
import VideoBuyMessage from "./VideoBuyMessage";
import { useIsFocused } from "@react-navigation/native";
import { Text } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { set } from "lodash";

const { height: screenHeight } = Dimensions.get("window");

type Props = {
  videoData: VideoItemType;
  isActive: boolean;
  isGlobalPlayer: boolean;
  showCommentsModal?: boolean;
  setShowCommentsModal?: (show: boolean) => void;
  onEpisodeChange?: (episodeData: any) => void;
  onStatsUpdate?: (stats: {
    likes?: number;
    gifts?: number;
    shares?: number;
    comments?: number;
  }) => void;
  containerHeight?: number;
};

const VideoPlayer = ({
  videoData,
  isActive,
  isGlobalPlayer = false,
  showCommentsModal = false,
  setShowCommentsModal,
  onEpisodeChange,
  onStatsUpdate,
  containerHeight,
}: Props) => {
  const {
    isGifted,
    isVideoPurchased,
    giftSuccessMessage,
    creator,
    videoName,
    series,
    isPurchasedPass,
    isPurchasedSeries,
    clearGiftingData,
    clearSeriesData,
    clearVideoAccessData,
    clearPassData,
  } = useGiftingStore();

  const [haveCreator, setHaveCreator] = useState(false);
  const [haveAccess, setHaveAccess] = useState<string | null>(null);

  const [showThumbnail, setShowThumbnail] = useState(true);

  const { _updateStatus } = usePlayerStore.getState();
  const { user } = useAuthStore();
  const isMutedFromStore = usePlayerStore((state) => state.isMuted);

  const [isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playerError, setPlayerError] = useState(false);

  const mountedRef = useRef(true);
  const statusListenerRef = useRef<any>(null);
  const timeListenerRef = useRef<any>(null);
  const playerRef = useRef<any>(null);

  const VIDEO_HEIGHT = containerHeight || screenHeight;
  const isFocused = useIsFocused();

  // Create player with proper cleanup
  const player = useVideoPlayer(videoData?.videoUrl || "", (p) => {
    p.loop = true;
    p.muted = isMutedFromStore;
  });

  // Store player reference
  useEffect(() => {
    playerRef.current = player;
    return () => {
      playerRef.current = null;
    };
  }, [player]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Handle player status changes
  useEffect(() => {
    if (!player || !videoData?.videoUrl) return;

    // if (videoData.created_by._id !== user?.id) {
    //   console.log("Video access:", haveAccess, haveCreator);
    //   if (
    //     (!haveCreator &&
    //       (videoData.amount != 0 ||
    //         (videoData.series && videoData.series.type !== "free"))) ||
    //     !haveAccess
    //   ) {
    //     if (!haveAccess) {
    //       Alert.alert(
    //         "Access Denied",
    //         "You do not have permission to view this video."
    //       );
    //       setShowThumbnail(true);
    //       console.log("thumbnail ", videoData.thumbnailUrl);
    //       return;
    //     }
    //   }
    // }

    const handleStatusChange = ({ status, error }: any) => {
      if (!mountedRef.current) return;

      setIsReady(status === "readyToPlay");
      setIsBuffering(status === "loading");
      setPlayerError(!!error);

      if (error) {
        console.error("Video player error:", error);
      }
    };

    statusListenerRef.current = player.addListener(
      "statusChange",
      handleStatusChange
    );

    return () => {
      if (statusListenerRef.current) {
        statusListenerRef.current.remove();
        statusListenerRef.current = null;
      }
    };
  }, [player, videoData?.videoUrl, haveCreator, haveAccess]);

  // Handle video playback based on focus and active state
  useEffect(() => {
    if (!player || !videoData?.videoUrl) return;

    const shouldPlay =
      isReady &&
      isActive &&
      isFocused &&
      !isGifted &&
      !playerError &&
      (haveAccess || haveCreator);

    try {
      if (shouldPlay) {
        player.muted = isMutedFromStore;
        player.play();
        setActivePlayer(player);
        usePlayerStore.getState().smartPlay();
      } else {
        player.pause();
        if (!isFocused || !isActive) {
          clearActivePlayer();
        }
      }
    } catch (error) {
      console.error("Error controlling video playback:", error);
      setPlayerError(true);
    }
  }, [
    isReady,
    isActive,
    isFocused,
    isGifted,
    isMutedFromStore,
    player,
    playerError,
    videoData?.videoUrl,
  ]);

  // Handle gifting state
  useEffect(() => {
    if (!player) return;

    try {
      if (isGifted) {
        player.pause();
      } else if (isActive && isFocused && isReady && !playerError) {
        player.play();
      }
    } catch (error) {
      console.error("Error handling gifting state:", error);
    }
  }, [isGifted, player, isActive, isFocused, isReady, playerError]);

  // Handle focus changes
  useEffect(() => {
    if (!player) return;

    try {
      if (!isFocused) {
        player.pause();
        player.muted = true;
        clearActivePlayer();
      } else if (isActive && isReady && !isGifted && !playerError) {
        player.muted = isMutedFromStore;
        player.play();
        setActivePlayer(player);
        usePlayerStore.getState().smartPlay();
      }
    } catch (error) {
      console.error("Error handling focus change:", error);
    }
  }, [
    isFocused,
    isActive,
    player,
    isMutedFromStore,
    isReady,
    isGifted,
    playerError,
  ]);

  // Handle player store updates
  useEffect(() => {
    if (!videoData?.videoUrl || !player) return;

    const handleStatus = (payload: any) => {
      if (isActive && mountedRef.current) {
        _updateStatus(payload.status, payload.error);
      }
    };

    statusListenerRef.current = player.addListener(
      "statusChange",
      handleStatus
    );
    timeListenerRef.current = player.addListener("timeUpdate", handleStatus);

    return () => {
      if (statusListenerRef.current) {
        statusListenerRef.current.remove();
        statusListenerRef.current = null;
      }
      if (timeListenerRef.current) {
        timeListenerRef.current.remove();
        timeListenerRef.current = null;
      }
    };
  }, [isActive, player, _updateStatus, videoData?.videoUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;

      // Clean up listeners
      if (statusListenerRef.current) {
        statusListenerRef.current.remove();
        statusListenerRef.current = null;
      }
      if (timeListenerRef.current) {
        timeListenerRef.current.remove();
        timeListenerRef.current = null;
      }

      // Clean up player
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          clearActivePlayer();
          // Use a timeout to ensure cleanup happens after component unmounts
          setTimeout(() => {
            if (playerRef.current) {
              try {
                playerRef.current.replace("");
              } catch (error) {
                console.log("Player cleanup error (expected):", error);
              }
            }
          }, 100);
        } catch (error) {
          console.log("Player cleanup error (expected):", error);
        }
      }
    };
  }, []);

  const dynamicStyles = StyleSheet.create({
    container: {
      height: VIDEO_HEIGHT,
      width: "100%",
      backgroundColor: "#000",
    },
    video: {
      width: "100%",
      height: "100%",
    },
    thumbnail: {
      position: "absolute",
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    spinner: {
      position: "absolute",
      top: "50%",
      left: "50%",
      marginLeft: -20,
      marginTop: -20,
    },
  });

  if (!videoData?.videoUrl) {
    return <View style={dynamicStyles.container} />;
  }

  if (playerError) {
    return (
      <View
        style={[
          dynamicStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Video unavailable
        </Text>
      </View>
    );
  }

  useEffect(() => {
    if(!haveCreator){
      setShowThumbnail(true);
    }
    if(haveAccess){
      setShowThumbnail(false);
    }
  }, [haveAccess, haveCreator]);

  return (
    <View style={dynamicStyles.container}>
      {(!isReady || showThumbnail) &&
        !isBuffering &&
        videoData.thumbnailUrl && (
          <View className="relative">
            <Image
              source={{ uri: videoData.thumbnailUrl }}
              style={dynamicStyles.thumbnail}
            />
            {/* <ActivityIndicator
            size="large"
            color="white"
            className="absolute w-full top-96"
          /> */}
          </View>
        )}

      {player && (haveCreator || haveAccess || videoData.amount == 0) ? (
        <VideoView
          player={player}
          nativeControls={false}
          style={dynamicStyles.video}
          contentFit="cover"
        />
      ) : (
        <View className="relative">
          <Image
            source={{ uri: videoData.thumbnailUrl }}
            style={dynamicStyles.thumbnail}
          />
        </View>
      )}

      {isBuffering && (
        <ActivityIndicator
          size="large"
          color="white"
          style={dynamicStyles.spinner}
        />
      )}

      <VideoControls
        haveCreatorPass={haveCreator}
        haveAccessPass={haveAccess}
        haveCreator={setHaveCreator}
        haveAccess={setHaveAccess}
        player={player}
        videoData={videoData}
        isGlobalPlayer={isGlobalPlayer}
        setShowCommentsModal={setShowCommentsModal}
        onEpisodeChange={onEpisodeChange}
        onStatsUpdate={onStatsUpdate}
      />

      {/* Uncomment if needed */}
      {/* <View className="absolute left-0 right-0 z-10 px-2" style={!isGlobalPlayer ? { bottom: 42.5 } : { bottom: 0 }}>
        <VideoProgressBar
          player={player}
          isActive={isActive}
          videoId={videoData._id}
          duration={videoData.duration || 0}
          access={videoData.access}
        />
      </View> */}

      <View className="z-10 absolute top-10 left-5">
        <Pressable onPress={() => router.push("/(dashboard)/wallet")}>
          <Image
            source={require("../../../../assets/images/Wallet.png")}
            className="size-10"
          />
        </Pressable>
      </View>

      {isGifted && (
        <GiftingMessage
          isVisible={true}
          onClose={clearGiftingData}
          creator={creator}
          amount={giftSuccessMessage}
        />
      )}

      {isVideoPurchased && (
        <VideoBuyMessage
          isVisible={true}
          onClose={clearVideoAccessData}
          creator={creator}
          name={videoName}
          amount={giftSuccessMessage}
        />
      )}

      {isPurchasedPass && (
        <CreatorPassBuyMessage
          isVisible={true}
          onClose={clearPassData}
          creator={creator}
          amount={giftSuccessMessage}
        />
      )}

      {isPurchasedSeries && series && (
        <SeriesPurchaseMessage
          isVisible={true}
          onClose={clearSeriesData}
          series={series}
        />
      )}

      {/* {showCommentsModal && setShowCommentsModal && (
        <CommentsSection
          onClose={() => setShowCommentsModal(false)}
          videoId={videoData._id}
          onPressUsername={(userId) => {
            try {
              router.push(`/(dashboard)/profile/public/${userId}`);
            } catch (error) {
              console.error("Navigation error:", error);
            }
          }}
          onPressTip={(commentId) => {
            console.log("Open tip modal for comment:", commentId);
          }}
          onCommentAdded={() => {
            if (onStatsUpdate) {
              const newCommentCount = (videoData.comments?.length || 0) + 1;
              onStatsUpdate({ comments: newCommentCount });
            }
          }}
        />
      )} */}
    </View>
  );
};

export default React.memo(VideoPlayer);
