import React, { useRef, useState, useEffect, useCallback } from "react";
import { FlatList, Dimensions, ActivityIndicator, Text, Pressable, View } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedView from "@/components/ThemedView";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import { VideoItemType } from "@/types/VideosType";
import GiftingMessage from "./_components/GiftingMessage";
import UnifiedVideoPlayer from "@/components/UnifiedVideoPlayer";
import CommentsSection from "./_components/CommentSection";
import VideoFeedDebug from "@/components/VideoFeedDebug";
import VideoContentGifting from "@/app/(payments)/Video/Video-Gifting";
import VideoPlayer from "./_components/VideoPlayer";

export type GiftType = {
  _id: string;
  name?: string;
  username: string;
  profile_photo: string;
};

const { height } = Dimensions.get("window");

const VideoFeed: React.FC = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_API_URL = CONFIG.API_BASE_URL;
  console.log('🔧 VideoFeed API URL:', BACKEND_API_URL);
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get("window"));

  // Get safe area insets
  const insets = useSafeAreaInsets();

  const BOTTOM_NAV_HEIGHT = 50; // Height of the bottom navigation bar

  // Calculate available height - use full screen height
  const adjustedHeight = screenDimensions.height;

  console.log('Screen height:', screenDimensions.height);
  console.log('Top inset:', insets.top);
  console.log('Bottom nav height:', BOTTOM_NAV_HEIGHT);
  console.log('Adjusted height:', adjustedHeight);

  const [visibleIndex, setVisibleIndex] = useState(0);
  const { token } = useAuthStore();

  // State for overlays
  const [isWantToGift, setIsWantToGift] = useState(false);
  const [isGifted, setIsGifted] = useState(false);
  const [giftingData, setGiftingData] = useState<GiftType | null>(null);
  const [giftSuccessMessage, setGiftSuccessMessage] = useState<any>();
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // Debug log for comments modal state changes
  useEffect(() => {
    console.log('🎬 VideoFeed: Comments modal state changed:', showCommentsModal);
  }, [showCommentsModal]);

  const fetchTrendingVideos = async () => {
    setLoading(true);
    try {
      console.log('🔧 VideoFeed Debug Info:');
      console.log('📍 BACKEND_API_URL:', BACKEND_API_URL);
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token length:', token?.length || 0);
      console.log('🔑 Token preview:', token ? `${token.substring(0, 20)}...` : 'null');

      if (!BACKEND_API_URL) {
        throw new Error('Backend API URL is not configured');
      }

      if (!token) {
        throw new Error('Authentication token is missing - user may not be logged in');
      }

      const url = `${BACKEND_API_URL}/videos/trending?page=1&limit=10`;
      console.log('📡 Fetching from:', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', res.status);
      console.log('📡 Response ok:', res.ok);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Fetch failed:');
        console.error('   Status:', res.status, res.statusText);
        console.error('   Response:', errorText);

        if (res.status === 401) {
          throw new Error('Authentication failed - please log in again');
        } else if (res.status === 403) {
          throw new Error('Access forbidden - invalid token');
        } else {
          throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }
      }

      const json = await res.json();
      console.log('✅ Videos fetched successfully:', json.data?.length || 0, 'videos');

      if (!json.data) {
        console.warn('⚠️ No data field in response:', json);
        setVideos([]);
      } else {
        setVideos(json.data);
      }
    } catch (err: any) {
      console.error('❌ Error fetching videos:', err);
      console.error('❌ Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack?.split('\n')[0]
      });
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Listen for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      console.log('📱 Window dimensions changed:', window);
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Focus effect to ensure proper layout when returning to this screen
  useFocusEffect(
    useCallback(() => {
      console.log('🎯 VideoFeed focused - recalculating layout');

      // Force layout recalculation with a small delay
      setTimeout(() => {
        const currentDimensions = Dimensions.get("window");
        console.log('📐 Recalculating layout - Height:', currentDimensions.height, 'Adjusted:', currentDimensions.height - BOTTOM_NAV_HEIGHT);
        setScreenDimensions(currentDimensions);
      }, 50); // Small delay to ensure navigation is complete
    }, [BOTTOM_NAV_HEIGHT])
  );

  useEffect(() => {
    if (token) {
      fetchTrendingVideos();
    } else {
      setError('Please log in to view videos');
      setLoading(false);
    }
  }, [token]);

  // OPTIMIZATION 1: Stabilize and throttle the onViewableItemsChanged callback
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      // Find the item that's most visible (highest percentage)
      const mostVisible = viewableItems.reduce((prev: any, current: any) => {
        return (current.percent || 0) > (prev.percent || 0) ? current : prev;
      });

      const newIndex = mostVisible.index;
      // Only update if index actually changed to reduce re-renders
      setVisibleIndex(prevIndex => prevIndex !== newIndex ? newIndex : prevIndex);
    }
  });

  // Add scroll handlers for better snapping
  const onScrollEndDrag = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    const currentIndex = Math.round(contentOffset.y / adjustedHeight);

    if (currentIndex !== visibleIndex) {
      setVisibleIndex(Math.max(0, Math.min(currentIndex, videos.length - 1)));
    }
  }, [visibleIndex, videos.length, adjustedHeight]);

  const onMomentumScrollEnd = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    const currentIndex = Math.round(contentOffset.y / adjustedHeight);

    if (currentIndex !== visibleIndex) {
      setVisibleIndex(Math.max(0, Math.min(currentIndex, videos.length - 1)));
    }
  }, [visibleIndex, videos.length, adjustedHeight]);

  // Handle episode change
  const handleEpisodeChange = useCallback((episodeData: any) => {
    console.log('🎬 VideoFeed: Episode change requested:', episodeData);

    if (!episodeData || !episodeData._id) {
      console.error('❌ Invalid episode data:', episodeData);
      return;
    }

    // Update the current video in the videos array
    setVideos(prevVideos => {
      const newVideos = [...prevVideos];
      const currentIndex = visibleIndex;

      if (currentIndex >= 0 && currentIndex < newVideos.length) {
        // Replace the current video with the selected episode
        newVideos[currentIndex] = {
          ...episodeData,
          // Ensure all required fields are present
          videoUrl: episodeData.videoUrl || episodeData.video,
          likes: episodeData.likes || 0,
          gifts: episodeData.gifts || 0,
          shares: episodeData.shares || 0,
          views: episodeData.views || 0,
          comments: episodeData.comments || [],
        };

        console.log('✅ VideoFeed: Episode switched successfully');
      }

      return newVideos;
    });
  }, [visibleIndex]);

  // OPTIMIZATION 2: Memoize the renderItem function with reduced dependencies
  const renderItem = useCallback(
    ({ item, index }: { item: VideoItemType; index: number }) => (
      <View style={{
        height: adjustedHeight,
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#000'
      }}>
        <VideoPlayer
        isGlobalPlayer={false}
          key={item._id}
          videoData={item}
          isActive={index === visibleIndex}
          containerHeight={adjustedHeight}
          showCommentsModal={showCommentsModal}
          setShowCommentsModal={setShowCommentsModal}
          onEpisodeChange={handleEpisodeChange}
          onStatsUpdate={(stats) => {
            // Handle stats update if needed
            console.log('Video stats updated:', stats);
          }}
        />
      </View>
    ),
    [visibleIndex, adjustedHeight, handleEpisodeChange, showCommentsModal, setShowCommentsModal]
  );

  // OPTIMIZATION 3: If all your video items have the same height (full screen), use getItemLayout
  // This is a major performance boost as it avoids on-the-fly layout calculations.
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: adjustedHeight,
      offset: adjustedHeight * index,
      index,
    }),
    [adjustedHeight]
  );

  if (loading) {
    return (
      <ThemedView style={{
        flex: 1,
        backgroundColor: 'black'
      }} className="justify-center items-center">
        <ActivityIndicator size="large" color="white" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={{
        flex: 1,
        backgroundColor: 'black'
      }} className="justify-center items-center px-4">
        <Text className="text-white text-center mb-4">Failed to load videos</Text>
        <Text className="text-red-400 text-center text-sm mb-4">{error}</Text>
        <Text className="text-gray-400 text-center text-xs">
          API URL: {BACKEND_API_URL || 'Not configured'}
        </Text>
        <Pressable
          onPress={fetchTrendingVideos}
          className="mt-4 bg-blue-600 px-4 py-2 rounded"
        >
          <Text className="text-white">Retry</Text>
        </Pressable>
      </ThemedView>
    );
  }

  // OPTIMIZATION 4: Refactored UI structure.
  // The FlatList is always rendered. Gifting components are rendered as overlays.
  return (
    <ThemedView style={{
      flex: 1,
      backgroundColor: 'black'
    }}>
      <VideoFeedDebug />
      {isGifted && giftingData ? (
        <GiftingMessage
          isVisible={isGifted}
          creator={giftingData}
          amount={giftSuccessMessage}
          onClose={(value: boolean) => setIsGifted(value)}
        />
      ) : isWantToGift && giftingData ? (
        <VideoContentGifting
          creator={giftingData}
          videoId={videos[visibleIndex]?._id || ''}
          setIsWantToGift={setIsWantToGift}
          setIsGifted={setIsGifted}
        />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          style={{ flex: 1, backgroundColor: '#000' }}
          overScrollMode="never" // Android: prevent over-scrolling
          alwaysBounceVertical={false} // iOS: prevent bouncing
          getItemLayout={getItemLayout}
          pagingEnabled
          scrollEnabled={!showCommentsModal}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 95, // Increased for stricter detection
            minimumViewTime: 200, // Increased for better stability
            waitForInteraction: false
          }}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          snapToInterval={adjustedHeight}
          snapToAlignment="start"
          removeClippedSubviews={false} // Disable to prevent content bleeding
          bounces={false} // Disable bouncing to prevent content bleeding
          disableIntervalMomentum={true} // Prevent momentum scrolling past snap points
          scrollEventThrottle={16}
          onScrollEndDrag={onScrollEndDrag}
          onMomentumScrollEnd={onMomentumScrollEnd}
          maxToRenderPerBatch={1} // Render only one item at once
          windowSize={1} // Smaller window size
          initialNumToRender={1} // Only render first item initially
          updateCellsBatchingPeriod={100} // Batch updates
        />
      )}

      {/* Comments modal - Rendered at VideoFeed level to cover entire screen */}
      {showCommentsModal && (
        <CommentsSection
          onClose={() => {
            console.log('🎬 VideoFeed: Closing comments modal');
            setShowCommentsModal(false);
          }}
          videoId={videos[visibleIndex]?._id || null}
          onPressUsername={(userId) => {
            console.log('Navigate to user profile:', userId);
            try {
              router.push(`/(dashboard)/profile/public/${userId}` as any);
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }}
          onPressTip={(commentId) => {
            console.log('Open tip modal for comment:', commentId);
            // You can implement tip modal logic here
          }}
        />
      )}
    </ThemedView>
  );
};

export default VideoFeed;