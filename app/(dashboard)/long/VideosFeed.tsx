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
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ThemedView from "@/components/ThemedView";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import { VideoItemType } from "@/types/VideosType";
import { Link, router, useFocusEffect } from "expo-router";
import VideoPlayer from "./_components/VideoPlayer";
import { clearActivePlayer } from "@/store/usePlayerStore";
import { useVideosStore } from "@/store/useVideosStore";
import { useOrientationStore } from "@/store/useOrientationStore";
import { RefreshControl } from "react-native-gesture-handler";

export type GiftType = {
  creator: {
    _id: string;
    username: string;
    profile_photo: string;
  };
  videoId: string;
};

const { height: screenHeight } = Dimensions.get("window");
const BOTTOM_NAV_HEIGHT = -50; // Height of your bottom navigation

// Define the height for each video item (adjust as needed)
const VIDEO_HEIGHT = screenHeight;

const VideosFeed: React.FC = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
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

  const PULL_THRESHOLD = 60;

  // Handle screen focus  // initially it's useFocusEffect
  useFocusEffect(
    useCallback(() => {
      // Small delay to prevent rapid focus changes
      const focusTimeout = setTimeout(() => {
        setIsScreenFocused(true);
        setVideoType(null);
        // If user is not logged in, redirect to sign-in
        if (!token || !isLoggedIn) {
          router.replace("/(auth)/Sign-up");
          return;
        }
        console.log("token: ", token);

        // Re-initialize if videos are empty and we should have data
        if (videos.length === 0 && !loading && !error) {
          setLoading(true);
          setPage(1);
          setHasMore(true);
          fetchTrendingVideos(1);
        }
      }, 100);

      return () => {
        clearTimeout(focusTimeout);
        setIsScreenFocused(false);
        // Clear any active players when leaving the screen with delay
        setTimeout(() => {
          clearActivePlayer();
        }, 200);
      };
    }, [token, isLoggedIn, videos.length, loading, error])
  );

  // Component mount/unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Delayed cleanup to prevent surface detachment issues
      setTimeout(() => {
        clearActivePlayer();
      }, 300);
    };
  }, []);

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

      if (!res.ok) throw new Error("Failed to fetch videos");
      const json = await res.json();

      if (!mountedRef.current) return;

      setVideos((prev) => {
        // For page 1, replace all videos. For subsequent pages, append.
        if (targetPage === 1) {
          return json.data || [];
        } else {
          const existingIds = new Set(prev.map((v) => v._id));
          const uniqueNew = (json.data || []).filter(
            (v: { _id: string }) => !existingIds.has(v._id)
          );
          return [...prev, ...uniqueNew];
        }
      });

      if ((json.data || []).length < limit) {
        setHasMore(false);
      }

      console.log(
        `Loaded ${json.data?.length || 0} videos for page ${targetPage} and hasMore ${hasMore}`
      );

      // Only increment page if we're not refreshing (targetPage === 1)
      if (targetPage !== 1) {
        setPage(targetPage + 1);
      } else {
        setPage(2);
        setVisibleIndex(0); // Reset visible index on refresh
      }
    } catch (err: any) {
      console.error("Error fetching videos:", err);
      if (mountedRef.current) {
        setError(err.message || "Something went wrong");
      }
    } finally {
      if (mountedRef.current) {
        setIsFetchingMore(false);
        setLoading(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    if (token && isLoggedIn) {
      fetchTrendingVideos(1);
    } else if (!token || !isLoggedIn) {
      setError("Please log in to view videos");
      setLoading(false);
    }
  }, [token, isLoggedIn]);

  //  drag top video down to refresh
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only enable if first video is visible
        return visibleIndex === 0 && gestureState.dy > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (visibleIndex === 0 && gestureState.dy > PULL_THRESHOLD) {
          console.log("Refreshing feed...");
          handleRefresh();
        }
      },
    })
  ).current;

  // Handle viewable items change with debouncing
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0 && isScreenFocused) {
        // Find the item that's most visible (highest percentage)
        const mostVisible = viewableItems.reduce((prev: any, current: any) => {
          return (current.percent || 0) > (prev.percent || 0) ? current : prev;
        });

        const currentIndex = mostVisible.index;
        if (currentIndex !== visibleIndex && currentIndex !== undefined) {
          setVisibleIndex(currentIndex);
        }

        // Prefetch when approaching end
        if (currentIndex === videos.length - 2 && hasMore && !isFetchingMore) {
          fetchTrendingVideos();
        }
      }
    },
    [visibleIndex, videos.length, hasMore, isFetchingMore, isScreenFocused]
  );

  // Add scroll handler to ensure proper snapping
  const onScrollEndDrag = useCallback(
    (event: any) => {
      const { contentOffset } = event.nativeEvent;
      const currentIndex = Math.round(contentOffset.y / VIDEO_HEIGHT);

      // Ensure we're at the correct position
      if (currentIndex !== visibleIndex && flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: Math.max(0, Math.min(currentIndex, videos.length - 1)),
          animated: true,
        });
      }
    },
    [visibleIndex, videos.length]
  );

  const onMomentumScrollEnd = useCallback(
    (event: any) => {
      const { contentOffset } = event.nativeEvent;
      const currentIndex = Math.round(contentOffset.y / VIDEO_HEIGHT);

      if (currentIndex !== visibleIndex) {
        setVisibleIndex(Math.max(0, Math.min(currentIndex, videos.length - 1)));
      }
    },
    [visibleIndex, videos.length]
  );

  // Stable viewability config - more strict to prevent bleeding
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 95, // Increased from 80 to 95 for stricter detection
    minimumViewTime: 200, // Increased from 200 to 200ms for better stability
    waitForInteraction: false,
  }).current;

  // Memoize render item with proper container
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

  // Stable getItemLayout
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: VIDEO_HEIGHT,
      offset: VIDEO_HEIGHT * index,
      index,
    }),
    []
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setError(null);
    setPage(1);
    setRefreshing(true);
    setHasMore(true);
    setVisibleIndex(0);

    fetchTrendingVideos(1).finally(() => {
      setRefreshing(false);
    });
  }, []);

  // Stable key extractor
  const keyExtractor = useCallback(
    (item: VideoItemType, index: number) => `${item._id}-${index}`,
    []
  );

  // Show loading while checking authentication or fetching videos
  if (loading && isFetchingMore) {
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
        <Text className="text-lg text-white">You watched all videos, no new videos Available.</Text>
        <Text className="text-lg text-white">
          Want to Upload your own{" "}
          <Link href={"/studio"} className="text-blue-500">
            Upload
          </Link>
        </Text>

        <Text className="text-white text-lg">Or</Text>

        <Pressable onPress={handleRefresh}>
          <Text className="text-blue-600 text-lg px-4">Refresh</Text>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={[]}>
      <ThemedView style={{ flex: 1 }} {...panResponder.panHandlers}>
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
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          onEndReachedThreshold={0.8}
          onEndReached={() => {
            if (hasMore && !isFetchingMore && isScreenFocused) {
              fetchTrendingVideos();
            }
          }}
          style={{ height: VIDEO_HEIGHT }}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          // Add loading indicator at the bottom
          ListFooterComponent={
            isFetchingMore ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color="white" />
              </View>
            ) : null
          }
          // incoming changes
          snapToInterval={VIDEO_HEIGHT}
          snapToAlignment="start"
          decelerationRate="normal"
          bounces={true} // Disable bouncing to prevent content bleeding
          scrollEventThrottle={16}
          disableIntervalMomentum={true} // Prevent momentum scrolling past snap points
          onScrollEndDrag={onScrollEndDrag}
          onMomentumScrollEnd={onMomentumScrollEnd}
          contentContainerStyle={{ backgroundColor: "#000" }}
          overScrollMode="never" // Android: prevent over-scrolling
          alwaysBounceVertical={false} // iOS: prevent bouncing
        />
      </ThemedView>
    </SafeAreaView>
  );
};

export default VideosFeed;
