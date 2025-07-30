import React, { useRef, useState, useEffect } from "react";
import { FlatList, Dimensions, ActivityIndicator, Text } from "react-native";
import VideoItem from "./VideoItem";
import ThemedView from "@/components/ThemedView";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import { VideoItemType } from "@/types/VideosType";

const { height } = Dimensions.get("screen");

const VideoFeed: React.FC = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [visibleIndex, setVisibleIndex] = useState(0);
  const { token, user, isLoggedIn } = useAuthStore();

  const fetchTrendingVideos = async () => {
    try {
      console.log('🎥 Fetching trending videos...');
      console.log('🔑 Token:', token?.substring(0, 20) + '...');
      console.log('🌐 API URL:', CONFIG.API_BASE_URL);

      const url = `${CONFIG.API_BASE_URL}/api/v1/videos/trending?page=1&limit=10`;
      console.log('📡 Full URL:', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to fetch videos: ${res.status}`);
      }

      const json = await res.json();
      console.log('✅ Videos fetched successfully:', json.data?.length || 0, 'videos');

      setVideos(json.data || []);
    } catch (err: any) {
      console.error('❌ Error fetching trending videos:', err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && isLoggedIn) {
      fetchTrendingVideos();
    } else {
      console.log('⚠️ No token available, cannot fetch videos');
      setError('Please log in to view videos');
      setLoading(false);
    }
  }, [token, isLoggedIn]);

  // Debug token when VideoFeed loads
  // useEffect(() => {
  //   console.log("=== VIDEO FEED TOKEN CHECK ===");
  //   console.log("Token:", token);
  //   console.log("Token length:", token?.length);
  //   console.log("Is logged in:", isLoggedIn);
  //   console.log("User:", user);
  //   console.log("=============================");
  // }, [token, isLoggedIn, user]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setVisibleIndex(newIndex);
    }
  });

  if (loading) {
    return (
      <ThemedView style={{ height }} className="justify-center items-center">
        <ActivityIndicator size="large" color="white" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={{ height }} className="justify-center items-center px-4">
        <Text className="text-white text-center mb-4">{error}</Text>
        <Text 
          className="text-blue-400 underline" 
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchTrendingVideos();
          }}
        >
          Tap to retry
        </Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ height }}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <VideoItem
            uri={item.videoUrl}
            isActive={index === visibleIndex}
            videoData={item} // Pass more data if needed
          />
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
