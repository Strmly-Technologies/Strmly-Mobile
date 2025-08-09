import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Pressable, Image } from "react-native";
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
import VideoContentGifting from "@/app/(payments)/Video/Video-Gifting";
import { router } from "expo-router";
import VideoProgressBar from "./VideoProgressBar";

const { height: screenHeight } = Dimensions.get("screen");
const VIDEO_HEIGHT = screenHeight;

type Props = {
  videoData: VideoItemType;
  isActive: boolean;
};

const VideoPlayer = ({ videoData, isActive }: Props) => {
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const [isWantToGift, setIsWantToGift] = useState(false);
  const [isGifted, setIsGifted] = useState(false);
  const [giftSuccessMessage, setGiftSuccessMessage] = useState<number | null>(
    null
  );

  // FIX: Gracefully handle cases where videoUrl might be missing
  if (!videoData?.videoUrl) {
    return <View style={styles.container} />; // Render an empty container
  }

  const { _updateStatus } = usePlayerStore.getState();
  const isMutedFromStore = usePlayerStore((state) => state.isMuted);

  const player = useVideoPlayer(videoData.videoUrl, (p) => {
    p.loop = true;
    p.muted = isMutedFromStore;
  });

  // This single, stable useEffect now manages the entire lifecycle
  useEffect(() => {
    const statusSubscription = player.addListener(
      "statusChange",
      (status, oldStatus, error) => {
        // Only the active video should update the global store
        if (isActive) {
          _updateStatus(status, error);
        }
      }
    );

    // Listen for playback status changes
    const playbackStatusSubscription = player.addListener(
      "playbackStatusUpdate",
      (status) => {
        if (isActive) {
          _updateStatus(status);
        }
      }
    );

    if (isActive) {
      // This video is visible and playing
      setActivePlayer(player);
      // Use the smart play function to handle audio interaction logic
      const { smartPlay } = usePlayerStore.getState();
      smartPlay();

    } else {
      // This video is not visible, pause and reset
      player.pause();
      player.currentTime = 0;
    }

    // This cleanup function is called when the component unmounts OR when `isActive` changes.
    return () => {
      // Always remove the listeners
      statusSubscription.remove();
      playbackStatusSubscription.remove();
      // If this was the active player, clear the global reference
      if (isActive) {
        clearActivePlayer();
      }
    };
  }, [isActive, player, _updateStatus]);

  // A final cleanup effect for when the component is removed from the FlatList entirely
  useEffect(() => {
    return () => {
      // FIX: Use replaceAsync to avoid blocking the UI thread
      player.replaceAsync(null);
    };
  }, [player]);

  return !isWantToGift ? (
    <View style={styles.container}>
      {isGifted ? (
        <GiftingMessage
          isVisible={true}
          onClose={setIsGifted}
          creator={videoData.created_by}
          amount={giftSuccessMessage}
          giftMessage={setGiftSuccessMessage}
        />
      ) : (
        <>
          <VideoView
            player={player}
            nativeControls={false}
            style={styles.video}
            contentFit="cover"
          />
          <VideoControls
            player={player}
            videoData={videoData}
            setShowCommentsModal={setShowCommentsModal}
            isWantToGift={setIsWantToGift}
          />

          <View className="absolute bottom-12 left-0 h-5 z-10 right-0">
            <VideoProgressBar player={player} isActive={isActive}/>
          </View>

          <View className="z-10 absolute top-16 left-5">
            <Pressable
              onPress={() => router.push("/(dashboard)/wallet")}
            >
              <Image
                source={require("../../../../assets/images/Wallet.png")}
                className="size-10"
              />
            </Pressable>
          </View>
        </>
      )}

      {showCommentsModal && (
        <CommentsSection
          onClose={() => setShowCommentsModal(false)}
          videoId={videoData._id}
          commentss={videoData.comments}
          longVideosOnly={videoData.type === "long"}
        />
      )}
    </View>
  ) : (
    <View style={styles.container}>
      <VideoContentGifting
        creator={videoData.created_by}
        videoId={videoData._id}
        setIsWantToGift={setIsWantToGift}
        setIsGifted={setIsGifted}
        giftMessage={setGiftSuccessMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: VIDEO_HEIGHT,
    width: "100%",
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});


export default React.memo(VideoPlayer);
