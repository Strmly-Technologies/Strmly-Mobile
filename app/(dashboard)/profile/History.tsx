import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import ThemedView from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { useThumbnailsGenerate } from "@/utils/useThumbnailGenerator";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";

const HistoryPage = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const { user, isLoggedIn, token, logout } = useAuthStore();
  const router = useRouter();

  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  const thumbnails = useThumbnailsGenerate(
    videos.map((video) => ({
      id: video._id,
      url: video.videoUrl,
    }))
  );

  const fetchUserHistory = async (token: string, page = 1, limit = 10) => {
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/user/history?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch history");

      return await response.json();
    } catch (error) {
      console.error("History fetch error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      if (!isLoggedIn || !token) return;
      try {
        setIsLoadingVideos(true);
        const res = await fetchUserHistory(token);
        setVideos(res.videos); // This is the formatted array from backend
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    loadHistory();
  }, [isLoggedIn, token]);

  return (
    <ThemedView>
      <View>
        {/* Video Grid */}
        {isLoadingVideos ? (
          <View className="w-full h-96 flex-1 items-center justify-center mt-20">
            <ActivityIndicator size="large" color="#F1C40F" />
          </View>
        ) : (
          <View className="mt-4 flex flex-row flex-wrap justify-start px-6">
            {videos.map((video) => (
              <TouchableOpacity
                key={video._id}
                className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black w-[32.33%] m-[0.5%] border border-gray-700" // Calculate width for 3 columns with small gap
              >
                {thumbnails[video._id] ? (
                  <Image
                    source={{ uri: thumbnails[video._id] }}
                    alt="video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <View className="w-full h-full flex items-center justify-center">
                    <Text className="text-white text-xs">Loading...</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ThemedView>
  );
};

export default HistoryPage;
