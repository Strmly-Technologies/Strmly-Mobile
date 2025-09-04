import { useVideoPlayer, VideoView } from "expo-video";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";
import { VideoItemType } from "@/types/VideosType";
import { useEvent } from "expo";

// const video: VideoItemType[] = [
//   {
//     videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
//     duration: 60,
//     videoResolutions: null
//   },
//   {
//     videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
//     duration: 60,
//     videoResolutions: {
//       "360p": { url: "https://sample-videos.com/video123/mp4/360/big_buck_bunny_360p_1mb.mp4" },
//       "720p": { url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" },
//     },
//   },
//   {
//     videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
//     duration: 10,
//     videoResolutions: {
//       "720p": { url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4" },
//       "1080p": { url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4" },
//     },
//   },
//   {
//     videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
//     duration: 30,
//     videoResolutions: {
//       "480p": { url: "https://www.w3schools.com/html/mov_bbb.mp4" },
//     },
//   },
// ];

const SPEEDS = [1.0, 1.2, 1.5, 2.0];
const { width, height } = Dimensions.get("window");

export default function VideoItem({
  video,
  isActive,
}: {
  video: VideoItemType;
  isActive: boolean;
}) {
  const [qualityIdx, setQualityIdx] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const player = useVideoPlayer(video.videoUrl, (plyr) => {
    plyr.loop = false;
    plyr.playbackRate = SPEEDS[speedIdx];
  });
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // Seek
  const [currentTime, setCurrentTime] = useState(0);
  player.addListener("timeUpdate", ({ currentTime }) =>
    setCurrentTime(currentTime)
  );

  // Only play/pause when active to save memory
  React.useEffect(() => {
    if (isActive) player.play();
    else player.pause();
  }, [isActive]);

  const [sliderValue, setSliderValue] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  // Listen to video player progress, but ignore updates when actively sliding
  React.useEffect(() => {
    const listener = player.addListener("timeUpdate", ({ currentTime }) => {
      if (!isSliding) setSliderValue(currentTime);
    });
    return () => listener.remove();
  }, [player, isSliding]);

  // UI Controls
  return (
    <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        allowsFullscreen={true}
        allowsPictureInPicture={true}
        nativeControls={false}
      />
      {showControls && (
        <View style={styles.controlsOverlay}>
          <TouchableOpacity
            onPress={() => (isPlaying ? player.pause() : player.play())}
          >
            <Text style={styles.controlBtn}>
              {isPlaying ? "Pause" : "Play"}
            </Text>
          </TouchableOpacity>

          <View style={styles.skipRow}>
            <TouchableOpacity onPress={() => player.seekBy(-10)}>
              <Text style={styles.controlBtn}>-10s</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => player.seekBy(10)}>
              <Text style={styles.controlBtn}>+10s</Text>
            </TouchableOpacity>
          </View>

          {/* Jump to time */}
          <Text>Jump to:</Text>
          <Slider
            minimumValue={0}
            maximumValue={video.duration}
            value={player.currentTime}
            onSlidingStart={() => setIsSliding(true)}
            onValueChange={setSliderValue}
            onSlidingComplete={(t) => {
              player.currentTime = t; // use seekTo, not currentTime
              setIsSliding(false);
            }}
            style={{ width: 180 }}
          />
          <Text>
            {Math.floor(sliderValue / 60)}:{Math.floor(sliderValue % 60)}/
            {Math.floor(video.duration / 60)}:{Math.floor(video.duration % 60)}
          </Text>

          {/* Speed */}
          <View style={styles.speedRow}>
            {SPEEDS.map((s, idx) => (
              <TouchableOpacity
                key={s}
                onPress={() => {
                  setSpeedIdx(idx);
                  player.playbackRate = s;
                  console.log(player.currentLiveTimestamp, player.playbackRate);
                }}
              >
                <Text
                  style={
                    speedIdx === idx ? styles.speedActive : styles.speedBtn
                  }
                >
                  {s}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quality */}
          {video?.videoResolutions && (
            <View style={styles.qualityRow}>
              {Object.entries(video.videoResolutions).map(
                ([label, res], idx) => (
                  <TouchableOpacity
                    key={label}
                    onPress={() => {
                      setQualityIdx(idx);
                      player.replace(res.url);
                    }}
                  >
                    <Text
                      style={
                        qualityIdx === idx
                          ? styles.qualityActive
                          : styles.qualityBtn
                      }
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}
        </View>
      )}
      <TouchableOpacity
        style={styles.touchArea}
        onPress={() => setShowControls((prev) => !prev)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: { width, height },
  video: { width: "100%", height: "100%" },
  controlsOverlay: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    padding: 16,
    zIndex: 20,
  },
  touchArea: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  controlBtn: { color: "white", fontSize: 16, padding: 6 },
  skipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  speedRow: { flexDirection: "row", marginVertical: 6 },
  speedBtn: { color: "#AAA", marginHorizontal: 4 },
  speedActive: { color: "#FFD700", marginHorizontal: 4, fontWeight: "bold" },
  qualityRow: { flexDirection: "row", marginVertical: 6 },
  qualityBtn: { color: "#AAA", marginHorizontal: 4 },
  qualityActive: { color: "#11FF22", marginHorizontal: 4, fontWeight: "bold" },
  orientRow: { flexDirection: "row", marginVertical: 8 },
});
