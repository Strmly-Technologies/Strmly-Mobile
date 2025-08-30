import React, { useState, useEffect, useCallback } from "react";
import { View, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { PlayIcon, PauseIcon } from "lucide-react-native";
import { usePlayerStore } from "@/store/usePlayerStore";
import InteractOptions from "./interactOptions";
import VideoDetails from "./VideoDetails";
import { VideoItemType } from "@/types/VideosType";
import { VideoPlayer } from "expo-video";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideosStore } from "@/store/useVideosStore";

type Props = {
  haveCreator: React.Dispatch<React.SetStateAction<boolean>>;
  haveAccess: React.Dispatch<React.SetStateAction<boolean>>;
  fetchCreator: React.Dispatch<React.SetStateAction<boolean>>;
  fetchAccess: React.Dispatch<React.SetStateAction<boolean>>;
  haveCreatorPass: boolean;
  haveAccessPass: boolean;
  player: VideoPlayer;
  videoData: VideoItemType;
  isGlobalPlayer: boolean;
  setShowCommentsModal?: (visible: boolean) => void;
  onEpisodeChange?: (episodeData: any) => void;

  onStatsUpdate?: (stats: {
    likes?: number;
    gifts?: number;
    shares?: number;
    comments?: number;
  }) => void;

  onToggleFullScreen: () => void;
};

const VideoControls = ({
  haveCreator,
  haveAccess,
  fetchCreator,
  fetchAccess,
  haveCreatorPass,
  haveAccessPass,
  player,
  videoData,
  isGlobalPlayer,
  setShowCommentsModal,
  onEpisodeChange,
  onStatsUpdate,
  onToggleFullScreen,
}: Props) => {
  const [playing, setPlaying] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [wantToBuyVideo, setWantToBuyVideo] = useState(false);
  const insets = useSafeAreaInsets();
  const { setVideosInZustand } = useVideosStore();

  useEffect(() => {
    if (wantToBuyVideo) {
      setVideosInZustand([videoData]);
    }
  }, [wantToBuyVideo]);

  useFocusEffect(
    useCallback(() => {
      // Reset states when the component is focused
      setPlaying(true);
      setBuffering(false);
    }, [])
  );

  // const isPlaying = usePlayerStore((state) => state.isPlaying);
  // const isBuffering = usePlayerStore((state) => state.isBuffering);
  // const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);

  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);

  // Subscribe to player events to keep UI in sync
  useEffect(() => {
    if (!player) return;

    const onStatus = (status: any) => {
      if (typeof status?.isPlaying === "boolean") setPlaying(status.isPlaying);
      if (typeof status?.isBuffering === "boolean")
        setBuffering(status.isBuffering);
    };

    const subStatus = player.addListener("statusChange", onStatus);
    const subTime = player.addListener("timeUpdate", onStatus); // extra safety: some platforms only fire this

    // Also try to prime initial state (in case status fired before mount)
    try {
      // These fields are present on the player in your codebase
      if (typeof (player as any).currentTime === "number") {
        // no-op, but ensures player object is ready
      }
    } catch {}

    return () => {
      subStatus?.remove?.();
      subTime?.remove?.();
    };
  }, [player]);

  useEffect(() => {
    let timer: NodeJS.Timeout | number;
    if (showPlayPauseIcon) {
      timer = setTimeout(() => setShowPlayPauseIcon(false), 800);
    }
    return () => clearTimeout(timer);
  }, [showPlayPauseIcon]);

  const handleTogglePlayPause = async () => {
    try {
      if (playing) {
        await player.pause();
        setPlaying(false); // optimistic
      } else {
        await player.play();
        setPlaying(true); // optimistic
      }
      setShowPlayPauseIcon(true);
    } catch (e) {
      console.error("play/pause error:", e);
    }
  };

  return (
    <>
      {(haveCreatorPass || haveAccessPass || videoData.amount === 0) && (
        <Pressable
          style={styles.fullScreenPressable}
          onPress={handleTogglePlayPause}
        />
      )}
      <View style={styles.iconContainer} pointerEvents="none">
        {showPlayPauseIcon &&
          (!playing ? (
            <PlayIcon size={40} color="white" />
          ) : (
            <PauseIcon size={40} color="white" />
          ))}
        {buffering && !showPlayPauseIcon && (
          <ActivityIndicator size="large" color="white" />
        )}
      </View>
      <View
        style={[
          isGlobalPlayer ? styles.interactGlobal : styles.interact,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <InteractOptions
          videoId={videoData._id}
          name={videoData.name}
          creator={videoData.created_by}
          likes={videoData.likes}
          gifts={videoData.gifts}
          shares={videoData.shares}
          comments={videoData.comments?.length}
          onCommentPress={
            setShowCommentsModal ? () => setShowCommentsModal(true) : undefined
          }
          onCommentUpdate={(newCount) => {
            if (onStatsUpdate) {
              onStatsUpdate({ comments: newCount });
            }
          }}
          // onShareUpdate={(newShares, isShared) =>
          //   onStatsUpdate?.({ shares: newShares })
          // }
          // onGiftUpdate={(newGifts) => onStatsUpdate?.({ gifts: newGifts })}
        />
      </View>

      <View
        style={[
          isGlobalPlayer ? styles.detailsGlobal : styles.details,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <VideoDetails
          haveCreator={haveCreator}
          haveAccess={haveAccess}
          fetchCreator={fetchCreator}
          fetchAccess={fetchAccess}
          setWantToBuyVideo={setWantToBuyVideo}
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
          onToggleFullScreen={onToggleFullScreen}
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
  interact: { position: "absolute", bottom: "20%", right: 10, zIndex: 5 },
  interactGlobal: { position: "absolute", bottom: "16%", right: 10, zIndex: 5 },
  details: {
    position: "absolute",
    bottom: "0%",
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 50,
    zIndex: 5,
  },
  detailsGlobal: {
    position: "absolute",
    bottom: "0%",
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 30,
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
