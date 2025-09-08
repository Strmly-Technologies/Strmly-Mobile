import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import ThemedView from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";
import ProfileTopbar from "@/components/profileTopbar";
import { VideoItemType } from "@/types/VideosType";
import { useVideosStore } from "@/store/useVideosStore";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("screen");
const PAGE_LIMIT = 10;

const HistoryPage = () => {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { isLoggedIn, token } = useAuthStore();
  const { setVideosInZustand } = useVideosStore();
  const router = useRouter();
  const BACKEND_API_URL = CONFIG.API_BASE_URL;

  /** 🔹 Fetch History API */
  const fetchUserHistory = useCallback(
    async (pageNum: number) => {
      if (!token) return [];

      try {
        const response = await fetch(
          `${BACKEND_API_URL}/user/history?page=${pageNum}&limit=${PAGE_LIMIT}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch history");

        const data = await response.json();
        return data?.videos || [];
      } catch (error) {
        console.error("History fetch error:", error);
        return [];
      }
    },
    [token]
  );

  /** 🔹 Initial load */
  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const loadHistory = async () => {
      setIsLoading(true);
      const initialVideos = await fetchUserHistory(1);
      setVideos(initialVideos);
      setVideosInZustand(initialVideos);
      setHasMore(initialVideos.length >= PAGE_LIMIT);
      setIsLoading(false);
    };

    loadHistory();
  }, [isLoggedIn, token]);

  /** 🔹 Load more on scroll */
  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    const nextPage = page + 1;
    setIsLoading(true);
    const newVideos = await fetchUserHistory(nextPage);

    if (newVideos.length > 0) {
      setVideos((prev) => [...prev, ...newVideos]);
      setVideosInZustand([...videos, ...newVideos]);
      setPage(nextPage);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  };

  /** 🔹 Render Grid Item */
  const renderGridItem = ({
    item,
    index,
  }: {
    item: VideoItemType;
    index: number;
  }) => (
    <TouchableOpacity
      className="relative aspect-[9/16] flex-1 rounded-sm overflow-hidden"
      onPress={() =>
        router.push({
          pathname: "/(dashboard)/long/GlobalVideoPlayer",
          params: { startIndex: index.toString() },
        })
      }
    >
      {item.thumbnailUrl ? (
        <Image
          source={{ uri: item.thumbnailUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-full items-center justify-center bg-gray-800">
          <Text className="text-white text-xs">No Thumbnail</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={[]}>
      <ThemedView className="flex-1">
        <ProfileTopbar isMore={false} hashtag={false} name="History" />

        {isLoading && videos.length === 0 ? (
          // 🔹 Loader for first load
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : videos.length === 0 ? (
          // 🔹 Empty state
          <View className="flex-1 items-center justify-center">
            <Text className="text-white text-lg">No history found</Text>
          </View>
        ) : (
          // 🔹 Video Grid
          <FlatList
            data={videos}
            keyExtractor={(item) => item._id}
            renderItem={renderGridItem}
            numColumns={3}
            contentContainerStyle={{ paddingTop: 20 }}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoading && videos.length > 0 ? (
                <ActivityIndicator
                  size="small"
                  color="white"
                  className="my-4"
                />
              ) : null
            }
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
};

export default HistoryPage;
