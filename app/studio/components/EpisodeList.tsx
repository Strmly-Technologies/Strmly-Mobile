import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import DropdownMenu from "./DropdownMenu";
import { useDeleteActions } from "../hooks/useDeleteActions";

interface Episode {
  _id: string;
  name: string;
  description: string;
  type: string;
  amount: number;
  videoUrl: string;
  thumbnailUrl: string;
  episode_number: number;
  season_number: number;
  created_by: {
    _id: string;
    username: string;
    email: string;
  };
  views: number;
  likes: number;
  gifts: number;
  creatorPassDetails: any;
}

interface EpisodeListProps {
  episodes: Episode[];
  seriesTitle: string;
  seriesId: string;
  onEpisodePress?: (episode: Episode) => void;
  onEpisodeDeleted?: () => void;
  onVideoPlayerOpen?: (episode: Episode, allEpisodes: Episode[]) => void;
}

const EpisodeList: React.FC<EpisodeListProps> = ({
  episodes,
  seriesTitle,
  seriesId,
  onEpisodePress,
  onEpisodeDeleted,
  onVideoPlayerOpen,
}) => {
  const { deleteEpisode, confirmDelete } = useDeleteActions();
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const handleEpisodePress = (episode: Episode) => {
    if (onEpisodePress) {
      onEpisodePress(episode);
    } else if (onVideoPlayerOpen) {
      // Use video player callback
      onVideoPlayerOpen(episode, episodes);
    } else {
      // Fallback to old navigation if no callback provided
      router.push({
        pathname: "/studio/episode-player/[id]",
        params: {
          id: episode._id,
          seriesTitle: seriesTitle,
          episodeNumber: episode.episode_number.toString(),
          seasonNumber: episode.season_number.toString(),
          episodeName: episode.name,
        },
      });
    }
  };

  const handleDeleteEpisode = async (
    episodeId: string,
    episodeName: string
  ) => {
    confirmDelete("episode", episodeName, async () => {
      try {
        await deleteEpisode(seriesId, episodeId);
        if (onEpisodeDeleted) {
          onEpisodeDeleted(); // Refresh the episodes list
        }
      } catch (error) {
        console.error("Failed to delete episode:", error);
        Alert.alert(
          "Delete Failed",
          `Failed to delete episode "${episodeName}". ${error instanceof Error ? error.message : "Please try again."}`,
          [{ text: "OK" }]
        );
      }
    });
  };

  if (!episodes || episodes.length === 0) {
    return (
      <View className="items-center py-8">
        <Ionicons name="film-outline" size={48} color="#666" />
        <Text className="text-gray-400 text-center mt-4">No episodes yet</Text>
        <Text className="text-gray-500 text-center text-sm mt-2">
          Add your first episode to get started
        </Text>
      </View>
    );
  }

  return (
    <>
      <View>
        {episodes.map((episode, index) => (
          <TouchableOpacity
            key={episode._id}
            onPress={() => handleEpisodePress(episode)}
            className="flex-row items-center mb-4 bg-gray-900 rounded-lg p-3"
          >
            {/* Episode Thumbnail */}
            <View className="w-16 h-12 rounded-lg mr-3 overflow-hidden bg-gray-700">
              {episode.thumbnailUrl ? (
                <Image
                  source={{ uri: episode.thumbnailUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Ionicons
                    name="play-circle-outline"
                    size={24}
                    color="#9CA3AF"
                  />
                </View>
              )}

              {/* Play overlay */}
              <View className="absolute inset-0 items-center justify-center">
                <View className="bg-black bg-opacity-60 rounded-full p-1">
                  <Ionicons name="play" size={16} color="white" />
                </View>
              </View>
            </View>

            {/* Episode Info */}
            <View className="flex-1">
              <Text
                className="text-white text-base font-medium mb-1"
                numberOfLines={1}
              >
                Episode {episode.episode_number}: {episode.name}
              </Text>
              <Text className="text-gray-400 text-sm mb-1" numberOfLines={1}>
                Season {episode.season_number}
              </Text>
              <Text className="text-gray-500 text-xs" numberOfLines={1}>
                By @{episode.created_by?.username || "Unknown"}
              </Text>
            </View>

            {/* Episode Stats */}
            <View className="items-center mr-4">
              <Text className="text-white text-sm font-medium">
                {formatNumber(episode.views || 0)}
              </Text>
              <Text className="text-gray-400 text-xs">Views</Text>
            </View>

            <View className="items-center mr-4">
              <Text className="text-white text-sm font-medium">
                {formatNumber(episode.likes || 0)}
              </Text>
              <Text className="text-gray-400 text-xs">Likes</Text>
            </View>

            {/* Menu Button */}
            <DropdownMenu
              options={[
                {
                  id: "delete",
                  label: "Delete",
                  icon: "trash-outline",
                  color: "#EF4444",
                  onPress: () => handleDeleteEpisode(episode._id, episode.name),
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

export default EpisodeList;
