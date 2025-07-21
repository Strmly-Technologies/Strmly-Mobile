import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import {
  useVideoPlayer,
  VideoView,
  type VideoPlayerStatus,
} from "expo-video";
import InteractOptions from "./_components/interactOptions";
import VideoDetails from "./_components/VideoDetails";

type Props = {
  uri: string;
  isActive: boolean;
};

const VideoItem = ({ uri, isActive }: Props) => {
  const { width, height } = useWindowDimensions();
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.volume = 1;
  });

  const [videoStatus, setVideoStatus] = useState<VideoPlayerStatus | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const subscription = player.addListener("statusChange", (event) => {
      setVideoStatus(event.status);
    });
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
      player.currentTime = 0;
    }
  }, [isActive, player]);

  // ✨ CORRECTED: This effect now starts the timer whenever the video is active.
  useEffect(() => {
    let interval: number;
    // We only need the timer when the video is the active one.
    if (isActive) {
      interval = setInterval(() => {
        // This will now run consistently for the active video.
        setCurrentTime(player.currentTime);
      }, 250);
    }
    // The cleanup function is crucial to stop the timer when the video is no longer active.
    return () => {
      clearInterval(interval);
    };
  }, [isActive, player]); // The effect now only depends on isActive.

  const duration = player.duration ?? 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showProgressBar = duration > 0;
  const isBuffering = ['buffering', 'loading'].includes(videoStatus ?? '');

  return (
    <View style={[styles.container, { width, height }]}>
      <VideoView 
        player={player} 
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />

      <View style={styles.overlay}>
        {isBuffering && <ActivityIndicator size="large" color="white" />}
        {showProgressBar && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        )}
      </View>

      <View style={{ position: "absolute", bottom: "15%", right: 10, width: "auto"}}>
        <InteractOptions />
      </View>

      <View style={{ position: "absolute", bottom: "5%", right: 10, width: "auto"}}>
        <VideoDetails />
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
  overlay: {
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
    bottom: 0,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
  },
});

export default VideoItem;