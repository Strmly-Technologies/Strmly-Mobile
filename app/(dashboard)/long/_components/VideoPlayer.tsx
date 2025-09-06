import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Dimensions,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
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
import { useGiftingStore } from "@/store/useGiftingStore";
import SeriesPurchaseMessage from "./SeriesPurcchaseMessaage";
import CreatorPassBuyMessage from "./CreatorPassBuyMessage";
import VideoBuyMessage from "./VideoBuyMessage";
import { useIsFocused } from "@react-navigation/native";
import { useAuthStore } from "@/store/useAuthStore";
import ModalMessage from "@/components/AuthModalMessage";
import * as ScreenOrientation from "expo-screen-orientation";
import { useOrientationStore } from "@/store/useOrientationStore";
import VideoProgressBar from "./VideoProgressBar";

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

  // Paid video states
  const [haveCreator, setHaveCreator] = useState(false);
  const [checkCreatorPass, setCheckCreatorPass] = useState(false);
  const [haveAccess, setHaveAccess] = useState(false);

  const { user } = useAuthStore();

  const [showWallet, setShowWallet] = useState(true);

  // Player store
  const { _updateStatus } = usePlayerStore.getState();
  const isMutedFromStore = usePlayerStore((state) => state.isMuted);

  const [isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  // const [hasSeeked, setHasSeeked] = useState(false);
  const [playerError, setPlayerError] = useState(false);

  // Local stats
  const [localStats, setLocalStats] = useState({
    likes: videoData.likes || 0,
    gifts: videoData.gifts || 0,
    shares: videoData.shares || 0,
    comments: videoData.comments?.length || 0,
  });

  // Comments refresh trigger
  const [commentsRefreshTrigger, setCommentsRefreshTrigger] = useState(0);

  const mountedRef = useRef(true);
  const statusListenerRef = useRef<any>(null);
  const timeListenerRef = useRef<any>(null);
  const playerRef = useRef<any>(null);

  const VIDEO_HEIGHT = containerHeight || screenHeight;
  const isFocused = useIsFocused();


  // FIX: Update local stats when videoData changes (e.g., when switching videos)
  useEffect(() => {
    setLocalStats({
      likes: videoData.likes || 0,
      gifts: videoData.gifts || 0,
      shares: videoData.shares || 0,
      comments: videoData.comments?.length || 0,
    });
  }, [videoData._id, videoData.likes, videoData.gifts, videoData.shares, videoData.comments?.length]);





  // Full screen:
  const { setOrientation, isLandscape } = useOrientationStore();

  // Access check states
  const [fetchVideoDataAccess, setFetchVideoDataAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [canPlayVideo, setCanPlayVideo] = useState(false);
  const [showPaidMessage, setShowPaidMessage] = useState(false);

  // Create player with proper cleanup
  const player = useVideoPlayer(videoData?.videoUrl || "", (p) => {
    p.loop = true;
    p.muted = isMutedFromStore;
  });

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

  // Update stats when videoData changes
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

  // Set Access and Creator pass state of user when data comes
  useEffect(() => {
    setHaveAccess(videoData.access.isPurchased);
    setHaveCreator(videoData.hasCreatorPassOfVideoOwner);
    setFetchVideoDataAccess(true);
  }, [videoData.hasCreatorPassOfVideoOwner, videoData.access.isPurchased]);

  // Update access if newly purchased
  useEffect(() => {
    if ((isPurchasedSeries || isVideoPurchased) && !haveAccess) {
      setHaveAccess(true);
    }
  }, [isVideoPurchased, isPurchasedSeries]);

  // Update creator pass if just purchased
  useEffect(() => {
    if (
      checkCreatorPass &&
      !haveCreator &&
      !videoData.hasCreatorPassOfVideoOwner
    ) {
      setHaveCreator(true);
    }
  }, [checkCreatorPass, haveCreator, videoData.hasCreatorPassOfVideoOwner]);

  // ✅ Separate useEffect for access check
  useEffect(() => {
    if (!videoData || !fetchVideoDataAccess) return;

    setAccessChecked(false);

    if (
      videoData.created_by._id !== user?.id &&
      videoData.amount !== 0 &&
      fetchVideoDataAccess
    ) {
      if (!haveCreator && !haveAccess) {
        setShowPaidMessage(true);
        setCanPlayVideo(false);
      } else {
        setShowPaidMessage(false);
        setCanPlayVideo(true);
      }
    } else {
      setShowPaidMessage(false);
      setCanPlayVideo(true);
    }

    setAccessChecked(true);
  }, [videoData, user?.id, haveCreator, haveAccess, fetchVideoDataAccess]);

  // Handle player status changes
  useEffect(() => {
    if (!player || !videoData?.videoUrl) return;

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
  }, [player, videoData?.videoUrl]);

  // Handle video playback
  useEffect(() => {
    if (!player || !videoData?.videoUrl) return;

    const shouldPlay =
      accessChecked &&
      canPlayVideo &&
      isReady &&
      isActive &&
      isFocused &&
      !isGifted &&
      !playerError;

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
    accessChecked,
    canPlayVideo,
    isReady,
    isActive,
    isFocused,
    isGifted,
    isMutedFromStore,
    player,
    playerError,
    videoData?.videoUrl,
  ]);

  // useEffect(() => {
  //   if (isReady && !hasSeeked) {
  //     player.currentTime = 5;
  //     setHasSeeked(true);
  //   }
  // }, [isReady, player, hasSeeked]);

  // Handle gifting pause
  useEffect(() => {
    if (!player) return;

    try {
      if (isGifted) {
        player.pause();
      } else if (
        isActive &&
        isFocused &&
        isReady &&
        !playerError &&
        canPlayVideo
      ) {
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
    canPlayVideo,
  ]);

  // Handle focus
  useEffect(() => {
    if (!player) return;

    try {
      if (!isFocused) {
        player.pause();
        player.muted = true;
        clearActivePlayer();
      } else if (
        isActive &&
        isReady &&
        !isGifted &&
        !playerError &&
        canPlayVideo
      ) {
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
    canPlayVideo,
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

  // Stats update
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

    if (onStatsUpdate) {
      onStatsUpdate(stats);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;

      if (statusListenerRef.current) {
        statusListenerRef.current.remove();
        statusListenerRef.current = null;
      }
      if (timeListenerRef.current) {
        timeListenerRef.current.remove();
        timeListenerRef.current = null;
      }

      if (playerRef.current) {
        try {
          playerRef.current.pause();
          clearActivePlayer();
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
      if (isLandscape) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        setOrientation(false);
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
        setOrientation(true);
      }
    } catch (err) {
      console.error("Orientation toggle error:", err);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      height: isLandscape ? screenWidth : VIDEO_HEIGHT,
      width: "100%",
      backgroundColor: "#000",
      position: "relative",
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
      position: "absolute",
      top: "50%",
      left: "50%",
      marginLeft: -20,
      marginTop: -20,
    },
  });

  // ✅ Safe fallback → show only thumbnail until access is checked
  if (!accessChecked) {
    return (
      <View style={dynamicStyles.container}>
        <Image
          source={{ uri: videoData.thumbnailUrl }}
          style={dynamicStyles.thumbnail}
        />
      </View>
    );
  }

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
      {!isReady || (accessChecked && showPaidMessage) && (
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

      {player && canPlayVideo ? (
        <View className="relative items-center justify-center">
          <VideoView
            player={player}
            nativeControls={false}
            style={dynamicStyles.video}
            contentFit="cover"
          />
          {isBuffering && (
            <ActivityIndicator
              size="large"
              color="white"
              style={dynamicStyles.spinner}
            />
          )}
        </View>
      ) : (
        <View className="relative">
          <Image
            source={{ uri: videoData.thumbnailUrl }}
            style={dynamicStyles.thumbnail}
          />
        </View>
      )}

      <VideoControls
        haveCreatorPass={haveCreator}
        haveAccessPass={haveAccess}
        haveCreator={setCheckCreatorPass}
        showWallet={setShowWallet}
        player={player}
        videoData={{
          ...videoData,
          likes: localStats.likes,
          gifts: localStats.gifts,
          shares: localStats.shares,
          comments: { length: localStats.comments },
        }}
        isGlobalPlayer={isGlobalPlayer}
        setShowCommentsModal={setShowCommentsModal}
        onCommentsModalOpen={() => {
          console.log('💰 Comments modal opened, triggering refresh');
          setCommentsRefreshTrigger(prev => prev + 1);
        }}
        onEpisodeChange={onEpisodeChange}
        onToggleFullScreen={onToggleFullScreen}
        onStatsUpdate={handleStatsUpdate}
      />

      <View className="absolute left-0 right-0 z-10 px-2" style={!isGlobalPlayer ? { bottom: 42.5 } : { bottom: 10 }}>
        <VideoProgressBar
          player={player}
          isActive={isActive}
          videoId={videoData._id}
          duration={videoData.duration || 0}
          access={videoData.access}
        />
      </View>

      {showWallet && (
        <View className={`z-10 absolute left-5 top-14`}>
          <Pressable onPress={() => router.push("/(dashboard)/wallet")}>
            <Image
              source={require("../../../../assets/images/Wallet.png")}
              className="size-10"
            />
          </Pressable>
        </View>
      )}

      {isGifted && (
        <View className="z-10 absolute w-full">
          <GiftingMessage
            isVisible={true}
            onClose={clearGiftingData}
            creator={creator}
            amount={giftSuccessMessage}
          />
        </View>
      )}

      {isVideoPurchased && (
        <View className="absolute z-10">
          <VideoBuyMessage
            isVisible={true}
            onClose={clearVideoAccessData}
            creator={creator}
            name={videoName}
            amount={giftSuccessMessage}
          />
        </View>
      )}

      {isPurchasedPass && (
        <View>
          <CreatorPassBuyMessage
            isVisible={true}
            onClose={clearPassData}
            creator={creator}
            amount={giftSuccessMessage}
          />
        </View>
      )}

      {isPurchasedSeries && series && (
        <View>
          <SeriesPurchaseMessage
            isVisible={true}
            onClose={clearSeriesData}
            series={series}
          />
        </View>
      )}

      {showCommentsModal && setShowCommentsModal && (
        <CommentsSection
          key={`comments-${videoData._id}`} // Stable key per video
          onClose={() => setShowCommentsModal(false)}
          videoId={videoData._id}
          refreshTrigger={commentsRefreshTrigger} // Pass refresh trigger
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
            const newCommentCount = localStats.comments + 1;
            setLocalStats((prev) => ({
              ...prev,
              comments: newCommentCount,
            }));
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
