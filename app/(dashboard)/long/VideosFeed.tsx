import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FlatList,
  Dimensions,
  ActivityIndicator,
  Text,
  Pressable,
  View,
  PanResponder,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedView from "@/components/ThemedView";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import { VideoItemType } from "@/types/VideosType";
import { Link, router, useFocusEffect } from "expo-router";
import VideoPlayer from "./_components/VideoPlayer";
import { clearActivePlayer } from "@/store/usePlayerStore";
import { useVideosStore } from "@/store/useVideosStore";
import { useOrientationStore } from "@/store/useOrientationStore";

const { height: screenHeight } = Dimensions.get("window");
const VIDEO_HEIGHT = screenHeight;
const PULL_THRESHOLD = 60;

const VideosFeed: React.FC = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  const { token, isLoggedIn } = useAuthStore();
  const { setVideoType } = useVideosStore();
  const flatListRef = useRef<FlatList>(null);
  const mountedRef = useRef(true);
  const { isLandscape } = useOrientationStore();
  const BACKEND_API_URL = CONFIG.API_BASE_URL;

  const insets = useSafeAreaInsets();
  const bottomOffset = insets.bottom;

  // ✅ Handle screen focus safely
  useFocusEffect(
    useCallback(() => {
      const focusTimeout = setTimeout(() => {
        setIsScreenFocused(true);
        setVideoType(null);

        if (!token || !isLoggedIn) {
          router.replace("/(auth)/Sign-up");
          return;
        }

        // Only fetch if no data loaded yet
        if (videos.length === 0) {
          setLoading(true);
          setPage(1);
          setHasMore(true);
          fetchTrendingVideos(1);
        }
      }, 100);

      return () => {
        clearTimeout(focusTimeout);
        setIsScreenFocused(false);
        setTimeout(() => clearActivePlayer(), 200);
      };
    }, [token, isLoggedIn])
  );

  // ✅ Handle mount/unmount cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      setTimeout(() => clearActivePlayer(), 300);
    };
  }, []);

  // ✅ Fetch videos with improved debug + key handling
  const fetchTrendingVideos = async (nextPage?: number) => {
    const targetPage = nextPage ?? page;

    if (!hasMore || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      console.log("Fetching videos for page:", targetPage);
      const res = await fetch(
        `${BACKEND_API_URL}/videos/all-videos?page=${targetPage}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", res.status);

      if (!res.ok) throw new Error("Failed to fetch videos");

      const text = await res.text();
      console.log("Raw response:", text);
      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch (err) {
        console.log("JSON parse error:", err);
      }

      if (!mountedRef.current) return;

      // ✅ Support both `data` and `videos` keys
      const newVideos = json.data || json.videos || [];

      setVideos((prev) => {
        if (targetPage === 1) return newVideos;
        const existingIds = new Set(prev.map((v) => v._id));
        const uniqueNew = newVideos.filter(
          (v: { _id: string }) => !existingIds.has(v._id)
        );
        return [...prev, ...uniqueNew];
      });

      // ✅ Handle hasMore correctly
      if (newVideos.length < limit) setHasMore(false);

      console.log(
        `Loaded ${newVideos.length} videos for page ${targetPage}, hasMore: ${newVideos.length >= limit}`
      );

      if (targetPage !== 1) {
        setPage(targetPage + 1);
      } else {
        setPage(2);
        setVisibleIndex(0);
      }
    } catch (err: any) {
      console.error("Error fetching videos:", err);
      if (mountedRef.current) setError(err.message || "Something went wrong");
    } finally {
      if (mountedRef.current) {
        setIsFetchingMore(false);
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // ✅ Initial load
  useEffect(() => {
    if (token && isLoggedIn && videos.length === 0) {
      fetchTrendingVideos(1);
    } else if (!token || !isLoggedIn) {
      setError("Please log in to view videos");
      setLoading(false);
    }
  }, [token, isLoggedIn]);

  // ✅ Pull-to-refresh gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        visibleIndex === 0 && gestureState.dy > 10,
      onPanResponderRelease: (_, gestureState) => {
        if (visibleIndex === 0 && gestureState.dy > PULL_THRESHOLD) {
          console.log("Refreshing feed...");
          handleRefresh();
        }
      },
    })
  ).current;

  // ✅ Viewable item tracking
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0 && isScreenFocused) {
        const mostVisible = viewableItems.reduce((prev: any, curr: any) =>
          (curr.percent || 0) > (prev.percent || 0) ? curr : prev
        );
        const currentIndex = mostVisible.index;
        if (currentIndex !== visibleIndex && currentIndex !== undefined) {
          setVisibleIndex(currentIndex);
        }
      }
    },
    [visibleIndex, isScreenFocused]
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 95,
    minimumViewTime: 200,
  }).current;

  // ✅ Render single video item
  const renderItem = useCallback(
    ({ item, index }: { item: VideoItemType; index: number }) => (
      <View
        style={{
          height: VIDEO_HEIGHT,
          width: "100%",
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        <VideoPlayer
          isGlobalPlayer={false}
          videoData={item}
          isActive={index === visibleIndex && isScreenFocused}
          showCommentsModal={showCommentsModal}
          setShowCommentsModal={setShowCommentsModal}
          containerHeight={VIDEO_HEIGHT}
        />
      </View>
    ),
    [visibleIndex, showCommentsModal, isScreenFocused]
  );

  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: VIDEO_HEIGHT,
      offset: VIDEO_HEIGHT * index,
      index,
    }),
    []
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    setPage(1);
    setHasMore(true);
    setVisibleIndex(0);
    fetchTrendingVideos(1);
  }, []);

  const keyExtractor = useCallback(
    (item: VideoItemType, index: number) => `${item._id}-${index}`,
    []
  );

  // ✅ UI states
  if (loading && videos.length === 0) {
    return (
      <ThemedView style={{ flex: 1 }} className="justify-center items-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">
          {!token || !isLoggedIn
            ? "Checking authentication..."
            : "Loading videos..."}
        </Text>
      </ThemedView>
    );
  }

  if (error && videos.length === 0) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <ThemedView
            style={{ flex: 1 }}
            className="justify-center items-center px-4"
          >
            <Text className="text-white text-center mb-4">
              Oops something went wrong!
            </Text>
            <Pressable
              onPress={handleRefresh}
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
      <ThemedView style={{ flex: 1 }} className="justify-center items-center">
        <Text className="text-lg text-white">You’re all caught up!</Text>
        <Text className="text-lg text-white">
          Want to upload your own{" "}
          <Link href={"/studio"} className="text-blue-500">
            Upload
          </Link>
        </Text>
        <Pressable onPress={handleRefresh}>
          <Text className="text-blue-600 text-lg px-4 mt-2">Refresh</Text>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "black", bottom: bottomOffset < 40 ? 2*bottomOffset : bottomOffset }} edges={[]}>
        <ThemedView
          style={{
            height: VIDEO_HEIGHT,
            width: "100%",
            backgroundColor: "black",
          }}
          {...panResponder.panHandlers}
        >
          <FlatList
            ref={flatListRef}
            data={videos}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            pagingEnabled
            scrollEnabled={!showCommentsModal && !isLandscape}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={1}
            removeClippedSubviews
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.8}
            onEndReached={() => {
              if (hasMore && !isFetchingMore && isScreenFocused) {
                fetchTrendingVideos();
              }
            }}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListFooterComponent={
              isFetchingMore ? (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <ActivityIndicator size="small" color="white" />
                </View>
              ) : null
            }
            snapToInterval={VIDEO_HEIGHT}
            snapToAlignment="start"
            decelerationRate="normal"
            bounces={true}
            scrollEventThrottle={16}
            disableIntervalMomentum
            contentContainerStyle={{ backgroundColor: "#000" }}
            overScrollMode="never"
            alwaysBounceVertical={false}
          />
        </ThemedView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default VideosFeed;
