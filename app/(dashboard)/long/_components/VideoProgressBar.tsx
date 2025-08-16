import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  Text,
  Pressable,
  GestureResponderEvent,
} from "react-native";
import { VideoPlayer } from "expo-video";

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
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const [dragProgress, setDragProgress] = useState(0);
  const progressBarContainerWidth = useRef<number>(0);

  const initialStartTime = access?.freeRange?.start_time ?? 0;
  const hasSeekedInitially = useRef(false);
  const seekInProgress = useRef(false);
  const wasPlayingBeforeSeek = useRef(false);
  const userInteracting = useRef(false);
  const touchStartTime = useRef(0);

  const lastTimeRef = useRef(0);

  useEffect(() => {
    if (isActive && lastTimeRef.current > 0) {
      const currentPlayerTime = player.currentTime || 0;
      if (Math.abs(lastTimeRef.current - currentPlayerTime) > 1) {
        console.log("Restoring position to:", lastTimeRef.current);
        const offset = lastTimeRef.current - currentPlayerTime;
        player.seekBy(offset);
      }
    }
  }, [isActive, player]);

  // Initial seek logic
  useEffect(() => {
    if (isActive && !hasSeekedInitially.current && initialStartTime >= 0) {
      hasSeekedInitially.current = true;
      if (initialStartTime > 0) {
        console.log("Initial seek to:", initialStartTime);
        player.seekBy(initialStartTime);
      }
      setCurrentTime(initialStartTime);
      player.play();
    }
  }, [isActive, initialStartTime, player]);

  // Time sync and milestone tracking - Optimized for performance
  useEffect(() => {
    if (!isActive) {
      setCurrentTime(0);
      return;
    }

    const interval = setInterval(() => {
      // Only sync time when user is definitely not interacting
      if (!isDragging && !seekInProgress.current && !userInteracting.current) {
        const time = typeof player.currentTime === "number" ? player.currentTime : 0;

        // Only update if time has changed significantly to reduce re-renders
        if (time >= 0 && Math.abs(time - lastTimeRef.current) > 0.2) {
          const timeDiff = Math.abs(time - lastTimeRef.current);
          
          // Handle looping: if time is much smaller than lastTime, it's likely a loop restart
          const isLoopRestart = time < 2 && lastTimeRef.current > duration - 2;
          
          // Simplified logic for better performance
          if (isLoopRestart || time >= lastTimeRef.current - 1 || timeDiff > 3) {
            setCurrentTime(time);
            lastTimeRef.current = time;
          }
        }
      }
    }, 300); // Slower updates to reduce CPU usage

    return () => clearInterval(interval);
  }, [isActive, player, isDragging, duration]);

  const handleProgressBarLayout = (event: LayoutChangeEvent) => {
    progressBarContainerWidth.current = event.nativeEvent.layout.width;
  };

  const handleSeek = (newTimeSeconds: number) => {
    if (seekInProgress.current) return;

    seekInProgress.current = true;

    try {
      if (newTimeSeconds < 0 || newTimeSeconds > duration) {
        return;
      }

      // Update local state immediately
      setCurrentTime(newTimeSeconds);
      lastTimeRef.current = newTimeSeconds;

      // Simple seek - just use direct assignment
      player.currentTime = newTimeSeconds;

    } catch (error) {
      // Silent error handling to reduce console spam
    } finally {
      seekInProgress.current = false;
    }
  };

  const handleTouchStart = (event: GestureResponderEvent) => {
    const containerWidth = progressBarContainerWidth.current;
    if (containerWidth > 0) {
      userInteracting.current = true;
      wasPlayingBeforeSeek.current = player.playing;
      setIsDragging(true);

      const touchX = event.nativeEvent.locationX;
      const seekPercentage = Math.max(0, Math.min(1, touchX / containerWidth));
      const newTime = seekPercentage * duration;

      setDragProgress(seekPercentage);
      setDragTime(newTime);
    }
  };

  const handleTouchMove = (event: GestureResponderEvent) => {
    if (!isDragging) return;

    const containerWidth = progressBarContainerWidth.current;
    if (containerWidth > 0) {
      const touchX = event.nativeEvent.locationX;
      const seekPercentage = Math.max(0, Math.min(1, touchX / containerWidth));
      const newTime = seekPercentage * duration;

      // Throttle updates to reduce re-renders
      if (Math.abs(newTime - (dragTime || 0)) > 0.1) {
        setDragProgress(seekPercentage);
        setDragTime(newTime);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const finalSeekTime = dragTime !== null ? dragTime : currentTime;

    setIsDragging(false);
    setDragTime(null);

    // Seek to final position
    if (finalSeekTime !== null && finalSeekTime >= 0 && finalSeekTime <= duration) {
      handleSeek(finalSeekTime);
      
      // Resume playback
      if (wasPlayingBeforeSeek.current) {
        setTimeout(() => player.play(), 50);
      }
    }

    // Re-enable time sync
    setTimeout(() => {
      userInteracting.current = false;
    }, 500);
  };

  const progress = isDragging ? dragProgress : (duration > 0 ? (currentTime / duration) : 0);
  const showProgressBar = duration > 0;

  if (!showProgressBar) return null;

  return (
    <View style={styles.progressBarContainer} onLayout={handleProgressBarLayout}>
      {/* Background track - gray/transparent */}
      <View style={styles.progressBarBackground} />

      {/* Filled progress - white bar that fills up as video progresses */}
      <View style={[styles.progressBar, {
        width: `${progress * 100}%`,
        opacity: isDragging ? 0.9 : 1,
      }]} />

      <Pressable
        style={styles.touchArea}
        onPressIn={handleTouchStart}
        onTouchMove={handleTouchMove}
        onPressOut={handleTouchEnd}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onPress={(event) => {
          // Handle quick taps
          const containerWidth = progressBarContainerWidth.current;
          if (containerWidth > 0 && !isDragging) {
            const touchX = event.nativeEvent.locationX;
            const seekPercentage = Math.max(0, Math.min(1, touchX / containerWidth));
            const newTime = seekPercentage * duration;

            console.log("Quick tap - seeking to:", newTime);
            handleSeek(newTime);

            // Ensure video continues playing
            if (!player.playing) {
              player.play();
            }
          }
        }}
      />

      {isDragging && dragTime !== null && (
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampText}>{formatTime(dragTime)}</Text>
        </View>
      )}
    </View>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: "100%",
    height: 20, // Increased height for better touch area
    justifyContent: "center",
    zIndex: 10,
    position: "relative",
  },
  progressBarBackground: {
    position: "absolute",
    width: "100%",
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Semi-transparent white background
    borderRadius: 2,
  },
  progressBar: {
    position: "absolute",
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "white", // Solid white fill
    borderRadius: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  touchArea: {
    position: "absolute",
    width: "100%",
    height: 16,
    top: -6,
    justifyContent: "center",
  },
  timestampContainer: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  timestampText: {
    color: "white",
    fontSize: 12,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 20,
  },
});

export default React.memo(VideoProgressBar, (prevProps, nextProps) => {
  // Only re-render if essential props change
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.duration === nextProps.duration &&
    prevProps.videoId === nextProps.videoId &&
    prevProps.player === nextProps.player
  );
});
