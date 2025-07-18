import React, { useEffect } from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";

const { height, width } = Dimensions.get("window");

type Props = {
  uri: string;
  isActive: boolean;
};

const VideoItem = ({ uri, isActive }: Props) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.volume = 1;
    p.play(); // Let it start buffering immediately
  });

  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });

  useEffect(() => {
    if (!player) return;
    if (isActive && status === "readyToPlay") {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, status]);

  return (
    <View style={styles.container}>
      {status === "readyToPlay" && (
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          nativeControls={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});

export default VideoItem;