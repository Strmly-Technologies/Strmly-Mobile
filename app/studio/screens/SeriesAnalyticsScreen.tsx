import React from 'react';
import { 
  View, 
  Text, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView, 
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Series, Episode } from '../types';

interface SeriesAnalyticsScreenProps {
  series: Series;
  onBack: () => void;
  onEditAccess: () => void;
  onAddNewEpisode: () => void;
  onEpisodeMenuPress: (episodeId: string) => void;
}

/**
 * Series Analytics Screen
 * Shows series analytics with episodes list and key metrics
 */
const SeriesAnalyticsScreen: React.FC<SeriesAnalyticsScreenProps> = ({
  series,
  onBack,
  onEditAccess,
  onAddNewEpisode,
  onEpisodeMenuPress
}) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(0)}M`;
    } else if (views >= 1000) {
      return `${Math.floor(views / 1000)}K`;
    }
    return views.toString();
  };

  const formatConversions = (conversions: number) => {
    if (conversions >= 1000) {
      return `${(conversions / 1000).toFixed(1)}K`;
    }
    return conversions.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', ',');
  };

  const handleEpisodeMenuPress = (episodeId: string) => {
    Alert.alert(
      'Episode Options',
      'Choose an action for this episode',
      [
        { text: 'Edit', onPress: () => console.log('Edit episode:', episodeId) },
        { text: 'Delete', onPress: () => console.log('Delete episode:', episodeId), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 mt-12">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-medium">{series.title}</Text>
        <TouchableOpacity onPress={onEditAccess}>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Series Stats */}
        <View className="pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-white text-base font-medium">Total episode: {series.totalEpisodes.toString().padStart(2, '0')}</Text>
              <Text className="text-gray-400 text-sm">Launch on {formatDate(series.launchDate)}</Text>
            </View>
            <TouchableOpacity
              onPress={onEditAccess}
              className="bg-transparent border border-gray-600 px-4 py-2 rounded-full"
            >
              <Text className="text-white text-sm">Edit access {formatCurrency(series.totalEarnings)}</Text>
            </TouchableOpacity>
          </View>

          {/* Key Metrics */}
          <View className="flex-row justify-between mb-8">
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">{formatViews(series.totalViews)}</Text>
              <Text className="text-gray-400 text-sm">Total view</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">{formatCurrency(series.totalEarnings)}</Text>
              <Text className="text-gray-400 text-sm">Total earning</Text>
            </View>
          </View>
        </View>

        {/* Episodes List */}
        {series.episodes.length > 0 ? (
          series.episodes.map((episode, index) => (
            <View
              key={episode.id}
              className="bg-gray-800 rounded-xl p-4 mb-3 flex-row items-center"
            >
              {/* Episode Thumbnail */}
              <View className="w-12 h-12 bg-purple-600 rounded-lg mr-4 items-center justify-center">
                <Ionicons name="play" size={20} color="white" />
              </View>

              {/* Episode Info */}
              <View className="flex-1">
                <Text className="text-white text-base font-medium mb-1">
                  {episode.title}
                </Text>
                <Text className="text-gray-400 text-sm">
                  Upload on {formatDate(episode.uploadDate)}
                </Text>
              </View>

              {/* Episode Stats */}
              <View className="items-center mr-4">
                <Text className="text-white text-base font-medium">{formatViews(episode.views)}</Text>
                <Text className="text-gray-400 text-xs">View</Text>
              </View>

              <View className="items-center mr-4">
                <Text className="text-white text-base font-medium">{formatConversions(episode.conversions)}</Text>
                <Text className="text-gray-400 text-xs">Convert</Text>
              </View>

              {/* Menu Button */}
              <TouchableOpacity 
                onPress={() => handleEpisodeMenuPress(episode.id)}
                className="p-2"
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          /* Empty Episodes State */
          <View className="items-center justify-center py-16">
            <Ionicons name="videocam-outline" size={64} color="#6B7280" />
            <Text className="text-gray-400 text-lg mt-4 mb-2">No episodes yet</Text>
            <Text className="text-gray-500 text-center px-8 mb-6">
              Start building your series by adding your first episode
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add New Episode Button */}
      <View className="px-4 pb-8 pt-4">
        <TouchableOpacity
          onPress={onAddNewEpisode}
          className="bg-gray-200 rounded-full py-4 items-center"
        >
          <Text className="text-black text-lg font-medium">Add new episode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SeriesAnalyticsScreen;