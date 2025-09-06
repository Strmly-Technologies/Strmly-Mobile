import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  Text,
  Pressable,
} from "react-native";
import { VideoPlayer } from "expo-video";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";

const PROGRESS_BAR_HEIGHT = 4; // Thicker progress bar like YouTube/TikTok

type AccessType = {
  isPlayable: boolean;
  freeRange: {
    start_time: number;
    display_till_time: number;
  };
  isPurchased: boolean;
  accessType: string;
  price: number;
};

type Props = {
  videoId: string;
  player: VideoPlayer;
  isActive: boolean;
  duration: number;
  access: AccessType;
};

const VideoProgressBar = ({
  videoId,
  player,
  isActive,
  duration,
  access,
}: Props) => {
  const [currentTime, setCurrentTime] = useState(0);
  const progressBarContainerWidth = useRef<number>(0);

  const initialStartTime = access?.freeRange?.start_time ?? 0;
  const hasSeekedInitially = useRef(false);

  const { token } = useAuthStore();
  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  useEffect(() => {
    console.log(
      "freeRange start:",
      initialStartTime,
      "duration:",
      duration,
      "for video:",
      videoId
    );
  }, [initialStartTime, videoId]);

  // ✅ API logic (untouched)
  const saveVideoToHistory = useCallback(async () => {
    if (!token || !videoId) return;
    try {
      const res = await fetch(`${BACKEND_API_URL}/user/history`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data.message || "Failed to save video to history");
        return;
      }
      console.log("Video saved to history:", data.message);
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  }, [token, videoId, BACKEND_API_URL]);

  const incrementVideoViews = useCallback(async () => {
    if (!token || !videoId) return;
    try {
      const res = await fetch(`${BACKEND_API_URL}/videos/${videoId}/view`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data.message || "Failed to increment video count");
        return;
      }
      console.log(data.message);
    } catch (err) {
      console.error("Failed to increment views:", err);
    }
  }, [token, videoId, BACKEND_API_URL]);

  // ✅ Track 2% milestone
  const hasTriggered2Percent = useRef(false);
  useEffect(() => {
    if (!isActive || duration <= 0) return;
    const percentWatched = (currentTime / duration) * 100;
    if (!hasTriggered2Percent.current && percentWatched >= 2) {
      hasTriggered2Percent.current = true;
      // saveVideoToHistory();
      // incrementVideoViews();
    }
  }, [currentTime, duration, isActive]);

  useEffect(() => {
    if (!isActive) hasTriggered2Percent.current = false;
  }, [isActive]);

  // ✅ Sync current time with interval (like working file)
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setCurrentTime(player.currentTime || 0);
    }, 250);
    return () => clearInterval(interval);
  }, [isActive, player]);

  // ✅ Handle initial seek if freeRange applies
  useEffect(() => {
    if (isActive && !hasSeekedInitially.current && initialStartTime > 0) {
      hasSeekedInitially.current = true;
      player.currentTime = initialStartTime;
      setCurrentTime(initialStartTime);
      player.play();
    }
  }, [isActive, initialStartTime, player]);

  // Layout width
  const handleProgressBarLayout = (event: LayoutChangeEvent) => {
    progressBarContainerWidth.current = event.nativeEvent.layout.width;
  };

  // ✅ Seek function (same as working file)
  const handleSeek = (locationX: number) => {
    const containerWidth = progressBarContainerWidth.current;
    if (!duration || !player || containerWidth <= 0) return;

    const seekPercentage = Math.max(0, Math.min(1, locationX / containerWidth));
    const newTimeSeconds = seekPercentage * duration;

    player.currentTime = newTimeSeconds;
    setCurrentTime(newTimeSeconds);
    player.play();
    console.log(
      "hit...",
      seekPercentage,
      newTimeSeconds,
      "for video:",
      videoId
    );
  };

  // Progress %
  const progress = duration > 0 ? currentTime / duration : 0;

  if (duration <= 0) return null;

  return (
    <>
      <View
      style={styles.progressBarContainer}
      onLayout={handleProgressBarLayout}
    >
      <View style={styles.progressBarBackground} />
      <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      <Pressable
        style={styles.touchArea}
        onPress={(event) => handleSeek(event.nativeEvent.locationX)}
      />
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: "100%",
    height: 20,
    justifyContent: "center",
    zIndex: 10,
    position: "relative",
  },
  progressBarBackground: {
    position: "absolute",
    width: "100%",
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "red",
    borderRadius: 2,
  },
  progressBar: {
    position: "absolute",
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "white",
    borderRadius: 2,
  },
  touchArea: {
    position: "absolute",
    width: "100%",
    height: 16,
    top: -6,
    justifyContent: "center",
  },
});

export default React.memo(VideoProgressBar, (prev, next) => {
  return (
    prev.isActive === next.isActive &&
    prev.duration === next.duration &&
    prev.videoId === next.videoId &&
    prev.player === next.player
  );
});
