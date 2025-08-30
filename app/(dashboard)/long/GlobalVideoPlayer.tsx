import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Dimensions,
  ActivityIndicator,
  Text,
  Pressable,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ThemedView from "@/components/ThemedView";
import { CONFIG } from "@/Constants/config";
import { VideoItemType } from "@/types/VideosType";

import {
  Link,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import VideoPlayer from "./_components/VideoPlayer";
import { useVideosStore } from "@/store/useVideosStore";
import BottomNavBar from "@/components/BottomNavBar";

export type GiftType = {
  creator: {
    _id: string;
    username: string;
    profile_photo: string;
  };
  videoId: string;
};

const { height: screenHeight } = Dimensions.get("window");
const VIDEO_HEIGHT = screenHeight;

const GlobalVideoPlayer: React.FC = () => {
  const params = useLocalSearchParams<{
    startIndex?: string;
    videoType?: string;
  }>();
  const startIndex = params.startIndex;
  const videoType = params.videoType ?? null;

  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleIndex, setVisibleIndex] = useState(
    startIndex ? parseInt(startIndex) : 0
  );

  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const { storedVideos, setVideoType } = useVideosStore();

  const BACKEND_API_URL = CONFIG.API_BASE_URL;

  const flatListRef = React.useRef<FlatList>(null);

  useEffect(() => {
    if (videos.length > 0 && startIndex) {
      // scroll to clicked video on mount
      flatListRef.current?.scrollToIndex({
        index: parseInt(startIndex),
        animated: false,
      });
    }
  }, [videos, startIndex]);

  useEffect(() => {
    if (storedVideos.length > 0) {
      setVideos(storedVideos);
      setLoading(false);
    }
  }, [storedVideos]);

  useFocusEffect(
    useCallback(() => {
      setVideoType(videoType ?? null);
    }, [videoType])
  );

  // OPTIMIZATION 1: Stabilize the onViewableItemsChanged callback
  // This prevents FlatList from re-rendering just because the parent re-rendered.
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const currentIndex = viewableItems[0].index;
      setVisibleIndex(currentIndex);
    }
  }, []);

  // OPTIMIZATION 2: Memoize the renderItem function
  // This prevents creating a new render function on every parent render.
  const renderItem = useCallback(
    ({ item, index }: { item: VideoItemType; index: number }) => (
      <VideoPlayer
        videoData={item}
        isActive={index === visibleIndex}
        isGlobalPlayer={true}
        showCommentsModal={showCommentsModal}
        setShowCommentsModal={setShowCommentsModal}
      />
    ),
    [visibleIndex, showCommentsModal]
  );

  // OPTIMIZATION 3: Use consistent VIDEO_HEIGHT for layout calculations
  // This ensures all videos have the same height and prevents layout issues
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: VIDEO_HEIGHT,
      offset: VIDEO_HEIGHT * index,
      index,
    }),
    [router]
  );

  // Show loading while checking authentication or fetching videos
  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <ThemedView
            style={{ height: VIDEO_HEIGHT }}
            className="justify-center items-center"
          >
            <ActivityIndicator size="large" color="white" />
            <Text className="text-white mt-4">Loading videos...</Text>
          </ThemedView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <ThemedView
            style={{ height: VIDEO_HEIGHT }}
            className="justify-center items-center px-4"
          >
            <Text className="text-white text-center mb-4">
              Oops something went wrong!
            </Text>
            {/* <Text className="text-red-400 text-center text-sm mb-4">
              {error}
            </Text> */}
            <Pressable
              onPress={() => {
                setLoading(() => true);
                setError(() => null);
              }}
              className="bg-blue-600 px-4 py-2 rounded"
            >
              <Text className="text-white">Retry</Text>
            </Pressable>
          </ThemedView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (videos.length === 0) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <ThemedView
            style={{ height: VIDEO_HEIGHT }}
            className="justify-center items-center"
          >
            <Text className="text-lg text-white">No Videos Available</Text>
            <Text className="text-lg text-white">
              Want to Upload your own{" "}
              <Link href={"/studio"} className="text-blue-500">
                Upload
              </Link>
            </Text>
          </ThemedView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    // <SafeAreaProvider>
    <ThemedView>
      <SafeAreaView>
        <FlatList
          ref={flatListRef}
          data={videos}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          getItemLayout={getItemLayout}
          pagingEnabled
          scrollEnabled={!showCommentsModal}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={3}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic" // iOS
          contentContainerStyle={{ paddingBottom: 0 }}
          style={{ height: VIDEO_HEIGHT }}
          // onScrollBeginDrag={() => {
          //   if (showCommentsModal) {
          //     console.log('🚫 VideosFeed: Scroll blocked - comments modal is open');
          //   }
          // }}
        />

        {/* <BottomNavBar /> */}
      </SafeAreaView>
    </ThemedView>
    // </SafeAreaProvider>
  );
};

export default GlobalVideoPlayer;
