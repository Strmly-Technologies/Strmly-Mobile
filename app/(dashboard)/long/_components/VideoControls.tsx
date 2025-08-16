import React, { useState, useEffect } from "react";
import { View, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { PlayIcon, PauseIcon } from "lucide-react-native";
import { usePlayerStore } from "@/store/usePlayerStore";
import InteractOptions from "./interactOptions";
import VideoDetails from "./VideoDetails";
import { VideoItemType } from "@/types/VideosType";

type Props = {
  videoData: VideoItemType;
  setShowCommentsModal?: (visible: boolean) => void;
  onEpisodeChange?: (episodeData: any) => void;
  onStatsUpdate?: (stats: { likes?: number; gifts?: number; shares?: number; comments?: number }) => void;
};

const VideoControls = ({
  videoData,
  setShowCommentsModal,
  onEpisodeChange,
  onStatsUpdate,
}: Props) => {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isBuffering = usePlayerStore((state) => state.isBuffering);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);

  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | number;
    if (showPlayPauseIcon) {
      timer = setTimeout(() => setShowPlayPauseIcon(false), 800);
    }
    return () => clearTimeout(timer);
  }, [showPlayPauseIcon]);

  const handleTogglePlayPause = () => {
    togglePlayPause();
    setShowPlayPauseIcon(true);
  };

  return (
    <>
      <Pressable
        style={styles.fullScreenPressable}
        onPress={handleTogglePlayPause}
      />
      <View style={styles.iconContainer} pointerEvents="none">
        {showPlayPauseIcon &&
          (!isPlaying ? (
            <PlayIcon size={40} color="white" />
          ) : (
            <PauseIcon size={40} color="white" />
          ))}
        {isBuffering && !showPlayPauseIcon && (
          <ActivityIndicator size="large" color="white" />
        )}
      </View>
      <View style={styles.interact}>
        <InteractOptions
          videoId={videoData._id}
          creator={videoData.created_by}
          likes={videoData.likes}
          gifts={videoData.gifts}
          shares={videoData.shares}
          comments={videoData.comments?.length}
          onCommentPress={setShowCommentsModal ? () => setShowCommentsModal(true) : undefined}
          onLikeUpdate={(newLikes, isLiked) => onStatsUpdate?.({ likes: newLikes })}
          onShareUpdate={(newShares, isShared) => onStatsUpdate?.({ shares: newShares })}
          onGiftUpdate={(newGifts) => onStatsUpdate?.({ gifts: newGifts })}
        />
      </View>
      <View style={styles.details}>
        <VideoDetails
          videoId={videoData._id}
          type={videoData.type}
          videoAmount={videoData.amount}
          is_monetized={videoData.is_monetized}
          name={videoData.name}
          series={videoData?.series}
          is_following_creator={videoData.is_following_creator}
          creatorPass={videoData?.creatorPassDetails}
          episode_number={videoData?.episode_number}
          createdBy={videoData?.created_by}
          community={videoData?.community}
          onEpisodeChange={onEpisodeChange}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  fullScreenPressable: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  iconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  interact: { position: "absolute", bottom: "22%", right: 10, zIndex: 5 },
  details: {
    position: "absolute",
    bottom: "2%",
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 50,
    zIndex: 5,
  },
  progressContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    height: 4,
    zIndex: 10,
  },
});

export default React.memo(VideoControls);
