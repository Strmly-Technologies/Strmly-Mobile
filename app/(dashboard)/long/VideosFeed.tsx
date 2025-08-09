import React, { useState, useEffect, useCallback } from "react";
import { FlatList, Dimensions, ActivityIndicator, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ThemedView from "@/components/ThemedView";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
import { VideoItemType } from "@/types/VideosType";
import VideoPlayer from "./_components/VideoPlayer";
import { Link, router } from "expo-router";

export type GiftType = {
  creator: {
    _id: string;
    username: string;
    profile_photo: string;
  };
  videoId: string;
};

const { height: screenHeight } = Dimensions.get("screen");
const VIDEO_HEIGHT = screenHeight;

const VideosFeed: React.FC = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);

  const { token } = useAuthStore();
  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  const fetchTrendingVideos = async () => {
    // This function is fine as is.
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_API_URL}/videos/trending`, { //recommendations/videos

        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch videos");
      const json = await res.json();
      setVideos(json.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingVideos();
  }, []);

  // OPTIMIZATION 1: Stabilize the onViewableItemsChanged callback
  // This prevents FlatList from re-rendering just because the parent re-rendered.
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index);
    }
  }, []); // Empty dependency array means this function is created only once.

  // OPTIMIZATION 2: Memoize the renderItem function
  // This prevents creating a new render function on every parent render.
  const renderItem = useCallback(
    ({ item, index }: { item: VideoItemType; index: number }) => (
      <VideoPlayer videoData={item} isActive={index === visibleIndex} />
    ),
    [visibleIndex]
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

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <ThemedView
            style={{ height: VIDEO_HEIGHT }}
            className="justify-center items-center"
          >
            <ActivityIndicator size="large" color="white" />
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
            className="justify-center items-center"
          >
            <Text className="text-white">{error}</Text>
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
    //   <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ThemedView>

          <FlatList
            data={videos}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            getItemLayout={getItemLayout}
            pagingEnabled
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={3}
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic" // iOS
            contentContainerStyle={{ paddingBottom: 0 }}
            style={{ height: VIDEO_HEIGHT }}
          />
        </ThemedView>
    //   </SafeAreaView>
    // </SafeAreaProvider>
  );
};

export default VideosFeed;
