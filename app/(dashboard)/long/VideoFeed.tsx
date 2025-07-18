// VideoFeed.tsx
import React, { useRef, useState } from "react";
import { FlatList, Dimensions } from "react-native";
import VideoItem from "./VideoItem";
import ThemedView from "@/components/ThemedView";

const { height } = Dimensions.get("window");

const videoData = [
  { id: "1", uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { id: "2", uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { id: "3", uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
];

const VideoFeed: React.FC = () => {
  const [visibleIndex, setVisibleIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setVisibleIndex(newIndex);
    }
  });

  return (
    <ThemedView className="flex-1 bg-black">
      <FlatList
        data={videoData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <VideoItem uri={item.uri} isActive={index === visibleIndex} />
        )}
        pagingEnabled
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
};

export default VideoFeed;