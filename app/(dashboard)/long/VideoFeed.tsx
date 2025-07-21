import React, { useRef, useState } from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import VideoItem from "./VideoItem";


const videoData = [
  { id: "1", uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { id: "2", uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { id: "3", uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
];

const VideoFeed = () => {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const { height } = useWindowDimensions(); // Use hook for dimensions

  // This callback updates which video is currently visible and should be active

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setVisibleIndex(newIndex);
    }

  }).current;

  return (
    <View style={{ flex: 1, backgroundColor: "black", position: "relative" }}>

      <FlatList
        data={videoData}
        keyExtractor={(item) => item.id}
          // Pass only the necessary props to VideoItem
          <VideoItem
            uri={item.uri}
            isActive={index === visibleIndex}
          />
        )}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      />
    </View>

  );
};

export default VideoFeed;