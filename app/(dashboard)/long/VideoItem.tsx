import React, { useEffect, useState, useRef, useCallback } from "react"; // Import useRef
import {
  View,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
  LayoutChangeEvent, // Import LayoutChangeEvent for onLayout
} from "react-native";
import { useVideoPlayer, VideoView, type VideoPlayerStatus } from "expo-video";
import InteractOptions from "./_components/interactOptions";
import VideoDetails from "./_components/VideoDetails";
import { Play } from "lucide-react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import CommentsSection from "./_components/CommentSection";


type Props = {
  uri: string;
  isActive: boolean;
};

// Define constants for layout to avoid magic numbers and make adjustments easier
const PROGRESS_BAR_HEIGHT = 2; // Keep your original height for the progress bar
const FULL_SCREEN_PRESSABLE_BOTTOM_OFFSET = PROGRESS_BAR_HEIGHT; // 10px buffer above progress bar

const VideoItem = ({ uri, isActive }: Props) => {
  const { width, height } = useWindowDimensions();
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.volume = 1;
  });

  const [videoStatus, setVideoStatus] = useState<VideoPlayerStatus | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Ref to store the layout (width) of the progress bar container
  const progressBarContainerWidth = useRef<number>(0);

  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const toggleFullScreen = async () => {
    const newState = !isFullScreen;
    setIsFullScreen(newState);
    if (newState) {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE // Use LANDSCAPE as per your original
      );
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    }

    // Original return, but this effect cleans up automatically on unmount
    // return () => {
    //   ScreenOrientation.unlockAsync();
    // };
  };

  const togglePlayPause = () => {
    if (isPaused) {
      player.play();
    } else {
      player.pause();
    }
    setIsPaused(!isPaused); // Keep your original manual toggle of isPaused
  };

  useEffect(() => {
    const subscription = player.addListener("statusChange", (event) => {
      setVideoStatus(event.status);
      // Your original statusChange listener did not update isPaused,
      // so we will respect that and keep isPaused managed by togglePlayPause.

    });
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
      player.currentTime = 0; // Keep your original currentTime reset
    }
  }, [isActive, player]);

  // This effect now starts the timer whenever the video is active.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>; // Corrected type for setInterval return

    // We only need the timer when the video is the active one.
    if (isActive) {
      interval = setInterval(() => {
        // This will now run consistently for the active video.
        setCurrentTime(player.currentTime);
      }, 250);
    }
    // The cleanup function is crucial to stop the timer when the video is no longer active.
    return () => {
      // Ensure interval is defined before clearing it
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, player]); // Keep original dependencies

  // Callback for when the progress bar container's layout is measured
  const handleProgressBarLayout = (event: LayoutChangeEvent) => {
    progressBarContainerWidth.current = event.nativeEvent.layout.width;
  };

  // Function to seek when the progress bar is pressed
  const handleProgressBarPress = (event: {
    nativeEvent: { locationX: number }; // Use number type
  }) => {
    if (progressBarContainerWidth.current > 0) {
      const containerWidth = progressBarContainerWidth.current;
      const touchX = event.nativeEvent.locationX;

      const seekPercentage = Math.max(0, Math.min(1, touchX / containerWidth));
      const newTimeSeconds = seekPercentage * (player.duration || 0);

      player.currentTime = newTimeSeconds; // Set the video playback position
      setCurrentTime(newTimeSeconds); // Immediately update local state for UI responsiveness

      // After seeking, always ensure the player is in the 'playing' state
      // This will ensure it continues playing from the new point.
      player.play();
      setIsPaused(false); // Update local state to reflect playing status immediately
    }
  };

  const duration = player.duration ?? 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showProgressBar = duration > 0;

  // Use `videoStatus ?? ""` to handle null for the includes method
  const isBuffering = ["buffering", "loading"].includes(videoStatus ?? "");

  // Function to open comments modal
  const handleOpenComments = useCallback(() => {
    setShowCommentsModal(true);
    player.pause(); // Optional: Pause video when comments modal opens
    setIsPaused(true);
  }, [player]);

  // Function to close comments modal
  const handleCloseComments = useCallback(() => {
    setShowCommentsModal(false);
    player.play(); // Optional: Resume video when comments modal closes
    setIsPaused(false);
  }, [player]);

  return (
    <View
      style={[
        styles.container,
        { width, height: isFullScreen ? width : height },
      ]}
    >
      {/* Updated fullScreenPressable to not cover the progress bar area */}
      <Pressable
        style={[
          styles.fullScreenPressable,
          { bottom: FULL_SCREEN_PRESSABLE_BOTTOM_OFFSET },
        ]}
        onPress={togglePlayPause}
      >
        {/* Video Layer */}
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />

        {/* Brown Overlay & Pause Icon */}
        {isPaused && (
          <View pointerEvents="none" style={styles.overlayLayer}>
            <View style={styles.brownOverlay} />
            <Play size={40} color="white" />
          </View>
        )}
      </Pressable>

      {/* Buffering Indicator - moved it out of the main overlay view to control zIndex better */}
      {isBuffering && (
        <View style={styles.bufferingIndicator}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* Progress Bar Container - now a Pressable for interaction */}
      {showProgressBar && (
        <Pressable
          style={styles.progressBarContainer}
          onLayout={handleProgressBarLayout} // Measure its width
          onPress={handleProgressBarPress} // Handle taps to seek
        >
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </Pressable>
      )}

      {/* Interact Buttons */}
      <View style={styles.interact}>
        <InteractOptions onCommentPress={handleOpenComments} />
      </View>

      {/* Conditionally render the CommentSection modal */}
      {showCommentsModal && (
        <CommentsSection
          isOpen={showCommentsModal} // Pass the state controlling its visibility
          onClose={handleCloseComments}
          videoId='1'
          longVideosOnly={false} // Or true, depending on your logic
        />
      )}

      {/* Video Info */}
      <View style={styles.details}>
        <VideoDetails
          onToggleFullScreen={toggleFullScreen}
          isFullScreen={isFullScreen}
        />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },

  // Separate buffering indicator styles for better z-index control
  bufferingIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    width: "100%",
    position: "absolute",
    bottom: 0, // Keep at the very bottom
    height: PROGRESS_BAR_HEIGHT, // Use the defined constant
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
  },
  // The fullScreenPressable's bottom is now set dynamically based on progress bar height
  fullScreenPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    // bottom property is set inline now
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  brownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  interact: {
    position: "absolute",
    bottom: "15%",
    right: 10,
    width: "auto",
  },
  details: {
    position: "absolute",
    bottom: "2%",
    width: "100%",
    paddingLeft: 10,
    paddingRight: 16,
  },
});

export default VideoItem;
