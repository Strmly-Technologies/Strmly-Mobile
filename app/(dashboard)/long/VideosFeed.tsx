import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FlatList,
  Dimensions,
  ActivityIndicator,
  Text,
  Pressable,
  View,
  StatusBar,
  RefreshControl,
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
const BOTTOM_NAV_HEIGHT = 50;
const VIDEO_HEIGHT = screenHeight - 49;

const VideosFeed: React.FC = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); // Renamed for clarity
  const [limit, setLimit] = useState(6);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { token, isLoggedIn } = useAuthStore();
  const { setVideoType } = useVideosStore();
  const flatListRef = useRef<FlatList>(null);
  const mountedRef = useRef(true);

  const { isLandscape } = useOrientationStore();

  const BACKEND_API_URL = CONFIG.API_BASE_URL;

  // Handle screen focus
  useFocusEffect(
    useCallback(() => {
      const focusTimeout = setTimeout(() => {
        setIsScreenFocused(true);
        setVideoType(null);
        if (!token || !isLoggedIn) {
          router.replace("/(auth)/Sign-up");
          return;
        }
        console.log('token: ', token);

        if (videos.length === 0 && !loading && !error) {
          setLoading(true);
          setCurrentPage(1);
          setHasMore(true);
          fetchTrendingVideos(1);
        }
      }, 100);

      return () => {
        clearTimeout(focusTimeout);
        setIsScreenFocused(false);
        setTimeout(() => {
          clearActivePlayer();
        }, 200);
      };
    }, [token, isLoggedIn, videos.length, loading, error])
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      setTimeout(() => {
        clearActivePlayer();
      }, 300);
    };
  }, []);

  const fetchTrendingVideos = async (pageToFetch?: number) => {
    // Use pageToFetch if provided, otherwise use currentPage + 1 for next page
    const targetPage = pageToFetch !== undefined ? pageToFetch : currentPage + 1;
    
    console.log(`Fetching page: ${targetPage}, Current page: ${currentPage}`);

    if (!hasMore || isFetchingMore) {
      console.log("Skipping fetch - hasMore:", hasMore, "isFetchingMore:", isFetchingMore);
      return;
    }

    setIsFetchingMore(true);
    try {
      console.log("Fetching from:", `${BACKEND_API_URL}/videos/all-videos?page=${targetPage}`);
      console.log("With token:", token ? "Present" : "Missing");
      
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
      console.log("Response ok:", res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }
      
      const json = await res.json();
      console.log("Success response:", json);
      
      if (!mountedRef.current) return;

      setVideos((prev) => {
        if (targetPage === 1) {
          console.log("Replacing videos with fresh data");
          return json.data || [];
        } else {
          const existingIds = new Set(prev.map((v) => v._id));
          const uniqueNew = (json.data || []).filter(
            (v: { _id: string }) => !existingIds.has(v._id)
          );
          console.log(`Adding ${uniqueNew.length} new unique videos`);
          return [...prev, ...uniqueNew];
        }
      });

      // Update currentPage to the page we just fetched
      setCurrentPage(targetPage);

      // Check if we have more pages
      if ((json.data || []).length < limit) {
        console.log("No more pages available");
        setHasMore(false);
      }

      console.log(`Loaded ${json.data?.length || 0} videos for page ${targetPage}`);

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

  useEffect(() => {
    if (token && isLoggedIn) {
      fetchTrendingVideos(1);
    } else if (!token || !isLoggedIn) {
      setError("Please log in to view videos");
      setLoading(false);
    }
  }, [token, isLoggedIn]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0 && isScreenFocused) {
        const mostVisible = viewableItems.reduce((prev: any, current: any) => {
          return (current.percent || 0) > (prev.percent || 0) ? current : prev;
        });

        const currentIndex = mostVisible.index;
        if (currentIndex !== visibleIndex && currentIndex !== undefined) {
          setVisibleIndex(currentIndex);
        }

        // Improved pagination trigger - fetch when we're near the end
        const threshold = 2; // Fetch when 2 videos from the end
        const shouldFetchMore = currentIndex >= videos.length - threshold && 
                               hasMore && 
                               !isFetchingMore &&
                               videos.length > 0;
        
        if (shouldFetchMore) {
          console.log(`Triggering pagination at index ${currentIndex} of ${videos.length} videos`);
          fetchTrendingVideos(); // This will fetch currentPage + 1
        }
      }
    },
    [visibleIndex, videos.length, hasMore, isFetchingMore, isScreenFocused, currentPage]
  );

  const onScrollEndDrag = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    const currentIndex = Math.round(contentOffset.y / VIDEO_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(currentIndex, videos.length - 1));

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

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 99,
    minimumViewTime: 300,
    waitForInteraction: false,
  }).current;

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

  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: VIDEO_HEIGHT,
      offset: VIDEO_HEIGHT * index,
      index,
    }),
    []
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    setCurrentPage(1); // Reset to page 1
    setHasMore(true);
    setVisibleIndex(0);
    
    try {
      await fetchTrendingVideos(1);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const keyExtractor = useCallback(
    (item: VideoItemType, index: number) => `${item._id}-${index}`,
    []
  );

  // Show loading while checking authentication or fetching videos
  if (loading && !refreshing) {
    return (
      <ThemedView
        style={{ flex: 1 }}
        className="justify-center items-center"
      >
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
    );
  }

  if (videos.length === 0) {
    return (
      <ThemedView
        style={{ flex: 1 }}
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
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={[]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="white"
            colors={["white"]}
            progressBackgroundColor="#1a1a1a"
            titleColor="white"
            title="Pull to refresh"
            progressViewOffset={0}
          />
        }
        ListFooterComponent={
          isFetchingMore ? (
            <View style={{ height: VIDEO_HEIGHT, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white mt-2">Loading more videos...</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default VideosFeed;