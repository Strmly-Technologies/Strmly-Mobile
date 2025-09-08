import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  PanResponder,
  Text,
} from "react-native";
import { VideoPlayer } from "expo-video";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";

const PROGRESS_BAR_HEIGHT = 4; // Thicker progress bar like YouTube/TikTok
const KNOB_SIZE = 14;

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

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const VideoProgressBar = ({
  videoId,
  player,
  isActive,
  duration,
  access,
}: Props) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);

  const dragTimeRef = useRef<number | null>(null);
  const progressBarContainerWidth = useRef<number>(0);

  const progressBarRef = useRef<View>(null);
  const [progressBarX, setProgressBarX] = useState(0);

  // const initialStartTime = access?.freeRange?.start_time ?? 0;
  const initialStartTime = 0;
  const hasSeekedInitially = useRef(false);

  const { token } = useAuthStore();
  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  // ✅ API calls (untouched)
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
      saveVideoToHistory();
      incrementVideoViews();
    }
  }, [currentTime, duration, isActive]);

  useEffect(() => {
    if (!isActive) hasTriggered2Percent.current = false;
  }, [isActive]);

  // ✅ Sync current time
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setCurrentTime(player.currentTime || 0);
    }, 250);
    return () => clearInterval(interval);
  }, [isActive, player]);

  // ✅ Handle initial seek
  useEffect(() => {
    if (isActive && !hasSeekedInitially.current && initialStartTime > 0) {
      hasSeekedInitially.current = true;
      player.currentTime = initialStartTime;
      setCurrentTime(initialStartTime);
      player.play();
    }
  }, [isActive, initialStartTime, player]);

  // ✅ Layout width
  const handleProgressBarLayout = (event: LayoutChangeEvent) => {
    progressBarContainerWidth.current = event.nativeEvent.layout.width;
    progressBarRef.current?.measure((x, y, width, height, pageX) => {
      setProgressBarX(pageX);
    });
  };

  // ✅ Drag handling with PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => setIsDragging(true),
      onPanResponderMove: (_, gestureState) => {
        const containerWidth = progressBarContainerWidth.current;
        if (containerWidth <= 0) return;

        const relativeX = gestureState.moveX - progressBarX;
        const clampedX = Math.max(0, Math.min(containerWidth, relativeX));

        const seekPercentage = clampedX / containerWidth;
        const newTime = seekPercentage * duration;

        dragTimeRef.current = newTime;
        setDragTime(newTime);
      },
      onPanResponderRelease: async () => {
        const finalTime = dragTimeRef.current;
        if (finalTime != null) {
          player.currentTime = finalTime;
          setCurrentTime(finalTime);
          player.play();
        }
        setIsDragging(false);
        setDragTime(null);
        dragTimeRef.current = null;
      },
    })
  ).current;

  const effectiveTime = isDragging && dragTime != null ? dragTime : currentTime;
  const progress = duration > 0 ? Math.min(effectiveTime / duration, 1) : 0;

  if (duration <= 0) return null;

  return (
    <View
      ref={progressBarRef}
      style={styles.progressBarContainer}
      onLayout={handleProgressBarLayout}
      {...panResponder.panHandlers}
    >
      {/* Background bar */}
      <View style={styles.progressBarBackground} />

      {/* Filled progress */}
      <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />

      {/* Knob (only while dragging) */}
      {isDragging && (
        <View
          style={[
            styles.knob,
            { left: `${progress * 100}%`, marginLeft: -KNOB_SIZE / 2 },
          ]}
        />
      )}

      {/* Tooltip above knob */}
      {isDragging && dragTime != null && (
        <View
          style={[
            styles.tooltip,
            { left: `${progress * 100}%`, marginLeft: -25 },
          ]}
        >
          <Text style={styles.tooltipText}>{formatTime(dragTime)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: "100%",
    height: 30,
    justifyContent: "center",
    position: "relative",
  },
  progressBarBackground: {
    position: "absolute",
    width: "100%",
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "#B0B0B0",
    borderRadius: 2,
  },
  progressBar: {
    position: "absolute",
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "white",
    borderRadius: 2,
  },
  knob: {
    position: "absolute",
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "red",
    top: (30 - KNOB_SIZE) / 2,
    zIndex: 20,
  },
  tooltip: {
    position: "absolute",
    bottom: 25,
    backgroundColor: "black",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 30,
  },
  tooltipText: {
    color: "white",
    fontSize: 12,
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
