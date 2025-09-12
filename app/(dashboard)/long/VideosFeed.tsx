import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FlatList,
  Dimensions,
  ActivityIndicator,
  Text,
  Pressable,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import ThemedView from "@/components/ThemedView";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import { VideoItemType } from "@/types/VideosType";
import { Link, router, useFocusEffect } from "expo-router";
import VideoPlayer from "./_components/VideoPlayer";
import { clearActivePlayer } from "@/store/usePlayerStore";
import { useVideosStore } from "@/store/useVideosStore";
import { useOrientationStore } from "@/store/useOrientationStore";

export type GiftType = {
  creator: {
    _id: string;
    username: string;
    profile_photo: string;
  };
  videoId: string;
};

const { height: screenHeight } = Dimensions.get("window");
const BOTTOM_NAV_HEIGHT = 50; // Height of your bottom navigation

// Define the height for each video item (adjust as needed)
const VIDEO_HEIGHT = screenHeight - 49;

const VideosFeed: React.FC = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  const { token, isLoggedIn } = useAuthStore();
  const { setVideoType } = useVideosStore();
  const flatListRef = useRef<FlatList>(null);
  const mountedRef = useRef(true);

  const { isLandscape } = useOrientationStore();

  const BACKEND_API_URL = CONFIG.API_BASE_URL;

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
        console.log('token: ', token);

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
        `${BACKEND_API_URL}/recommendations/videos?page=${targetPage}`,
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
          return json.recommendations || [];
        } else {
          const existingIds = new Set(prev.map((v) => v._id));
          const uniqueNew = (json.recommendations || []).filter(
            (v: { _id: string }) => !existingIds.has(v._id)
          );
          return [...prev, ...uniqueNew];
        }
      });

      if ((json.recommendations || []).length < limit) {
        setHasMore(false);
      }

      console.log(
        `Loaded ${json.recommendations?.length || 0} videos for page ${targetPage}`
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
        setLoading(false);
        setIsFetchingMore(false);
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

  // Handle viewable items change with debouncing
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
  const onScrollEndDrag = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    const currentIndex = Math.round(contentOffset.y / VIDEO_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(currentIndex, videos.length - 1));

    // Force scroll to exact position if not aligned
    if (Math.abs(contentOffset.y - (clampedIndex * VIDEO_HEIGHT)) > 10 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: clampedIndex,
        animated: true,
      });
    }

    if (clampedIndex !== visibleIndex) {
      setVisibleIndex(clampedIndex);
    }
  }, [visibleIndex, videos.length]);

  const onMomentumScrollEnd = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    const currentIndex = Math.round(contentOffset.y / VIDEO_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(currentIndex, videos.length - 1));

    // Force scroll to exact position if not aligned
    if (Math.abs(contentOffset.y - (clampedIndex * VIDEO_HEIGHT)) > 10 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: clampedIndex,
        animated: false,
      });
    }

    if (clampedIndex !== visibleIndex) {
      setVisibleIndex(clampedIndex);
    }
  }, [visibleIndex, videos.length]);

  // Stable viewability config - more strict to prevent bleeding
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 99, // Very strict - only consider visible when 99% is shown
    minimumViewTime: 300, // Longer minimum view time for stability
    waitForInteraction: false,
  }).current;

  // Memoize render item with proper container
  const renderItem = useCallback(
    ({ item, index }: { item: VideoItemType; index: number }) => (
      <View style={{
        height: VIDEO_HEIGHT,
        width: '100%',
        backgroundColor: '#000',
        position: 'relative'
      }}>
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
    setHasMore(true);
    setVisibleIndex(0);
    fetchTrendingVideos(1);
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
        <Text className="text-lg text-white">No Videos Available</Text>
        <Text className="text-lg text-white">
          Want to Upload your own{" "}
          <Link href={"/studio"} className="text-blue-500">
            Upload
          </Link>
        </Text>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={[]}>
      {/* <ThemedView style={{flex: 1}}> */}
      
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        pagingEnabled={true}
        scrollEnabled={!showCommentsModal && !isLandscape}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={1}

        windowSize={3}

        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        snapToInterval={VIDEO_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={false}
        scrollEventThrottle={16}
        disableIntervalMomentum={true}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={{ flex: 1, backgroundColor: '#000' }}
        contentContainerStyle={{ backgroundColor: '#000' }}
        overScrollMode="never"
        alwaysBounceVertical={false}
        ListFooterComponent={
          isFetchingMore ? (
            <View style={{ height: VIDEO_HEIGHT, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default VideosFeed;
