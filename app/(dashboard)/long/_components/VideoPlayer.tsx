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
import ModalMessage from "@/components/AuthModalMessage";
import * as ScreenOrientation from "expo-screen-orientation";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

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
  const [haveAccess, setHaveAccess] = useState(false);
  const [fetchCreator, setFetchCreator] = useState(false);
  const [fetchAccess, setFetchAccess] = useState(false);
  const [showPaidMessage, setShowPaidMessage] = useState(false);

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

  // Comments state
  const [localStats, setLocalStats] = useState({
    likes: videoData.likes || 0,
    gifts: videoData.gifts || 0,
    shares: videoData.shares || 0,
    comments: videoData.comments?.length || 0,
  });

  // Full screen:
  const [showFullScreen, setShowFullScreen] = useState(false);

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

  useEffect(() => {
    setLocalStats({
      likes: videoData.likes || 0,
      gifts: videoData.gifts || 0,
      shares: videoData.shares || 0,
      comments: videoData.comments?.length || 0,
    });
  }, [
    videoData._id,
    videoData.likes,
    videoData.gifts,
    videoData.shares,
    videoData.comments?.length,
  ]);

  // Handle player status changes
  useEffect(() => {
    if (!player || !videoData?.videoUrl) return;

    if (videoData.created_by._id !== user?.id && videoData.amount !== 0) {
      if (fetchAccess && fetchCreator) {
        if (
          (!haveCreator &&
            (videoData.amount != 0 ||
              (videoData.series && videoData.series.type !== "free"))) ||
          !haveAccess
        ) {
          if (!haveCreator && !haveAccess) {
            setShowPaidMessage(true);
            setShowThumbnail(true);
            return;
          }
        }
      } else {
        return;
      }
    }
    console.log("video name", videoData.name, haveAccess, haveCreator);

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
  }, [
    player,
    videoData?.videoUrl,
    haveCreator,
    haveAccess,
    fetchAccess,
    fetchCreator,
    videoData.amount,
  ]);

  // Handle video playback based on focus and active state
  useEffect(() => {
    if (!player || !videoData?.videoUrl) return;
    if (!fetchCreator || !fetchAccess) return;

    const shouldPlay =
      isReady && isActive && isFocused && !isGifted && !playerError;

    console.log(
      "Should play?",
      shouldPlay,
      isReady,
      isActive,
      isFocused,
      isGifted,
      playerError
    );

    try {
      if (shouldPlay) {
        console.log("should Playing video");
        player.muted = isMutedFromStore;
        player.play();
        setActivePlayer(player);
        usePlayerStore.getState().smartPlay();
      } else {
        console.log("should not Play video");
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
    fetchAccess,
    fetchCreator,
    haveAccess,
    haveCreator,
    videoData.amount,
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
  }, [
    isGifted,
    player,
    isActive,
    isFocused,
    isReady,
    playerError,
    haveAccess,
    haveCreator,
  ]);

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
    haveAccess,
    haveCreator,
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
  }, [
    isActive,
    player,
    _updateStatus,
    videoData?.videoUrl,
    haveAccess,
    haveCreator,
    fetchAccess,
    fetchCreator,
    videoData.amount,
  ]);

  // FIX: Handle local stats updates
  const handleStatsUpdate = (stats: {
    likes?: number;
    gifts?: number;
    shares?: number;
    comments?: number;
  }) => {
    setLocalStats((prev) => ({
      ...prev,
      ...stats,
    }));

    // Also call the parent callback
    if (onStatsUpdate) {
      onStatsUpdate(stats);
    }
  };

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

  const onToggleFullScreen = async () => {
    try {
      if (showFullScreen) {
        // Exit fullscreen → back to portrait
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        setShowFullScreen(false);
      } else {
        // Enter fullscreen → landscape
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
        setShowFullScreen(true);
      }
    } catch (err) {
      console.error("Orientation toggle error:", err);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      height: showFullScreen ? screenWidth : VIDEO_HEIGHT,
      width: "100%",
      backgroundColor: "#000",
    },
    video: {
      width: "100%",
      height: "100%",
    },
    thumbnail: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    spinner: {
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

  return (
    <View style={dynamicStyles.container}>
      {!isReady && showThumbnail && (
        <View className="relative">
          <Image
            source={{ uri: videoData.thumbnailUrl }}
            style={dynamicStyles.thumbnail}
          />
          {showPaidMessage && (
            <ModalMessage
              visible={true}
              text={`Access Denied
You do not have permission to view this video.`}
              needCloseButton={true}
              onClose={() => setShowPaidMessage(false)}
            />
          )}
        </View>
      )}

      {player && (haveCreator || haveAccess || videoData.amount === 0) ? (
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
        fetchCreator={setFetchCreator}
        fetchAccess={setFetchAccess}
        haveCreator={setHaveCreator}
        haveAccess={setHaveAccess}
        player={player}
        videoData={{
          ...videoData,
          // FIX: Pass local stats instead of original videoData stats
          likes: localStats.likes,
          gifts: localStats.gifts,
          shares: localStats.shares,
          comments: { length: localStats.comments }, // Maintain the structure expected by VideoControls
        }}
        isGlobalPlayer={isGlobalPlayer}
        setShowCommentsModal={setShowCommentsModal}
        onEpisodeChange={onEpisodeChange}
        onToggleFullScreen={onToggleFullScreen}
        onStatsUpdate={handleStatsUpdate}
      />

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

      {showCommentsModal && setShowCommentsModal && (
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
            // FIX: Increment local comment count immediately
            const newCommentCount = localStats.comments + 1;

            setLocalStats((prev) => ({
              ...prev,
              comments: newCommentCount,
            }));

            // Update the parent's stats
            if (onStatsUpdate) {
              onStatsUpdate({ comments: newCommentCount });
            }
          }}
        />
      )}
    </View>
  );
};

export default React.memo(VideoPlayer);
