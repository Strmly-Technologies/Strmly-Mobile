import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Series } from '../types';

interface SeriesSelectionScreenProps {
  onBack: () => void;
  onSeriesSelected: (series: Series) => void;
  onAddNewSeries: () => void;
}

/**
 * Series Selection Screen
 * Displays list of user's series and allows selection or creation of new series
 */
const SeriesSelectionScreen: React.FC<SeriesSelectionScreenProps> = ({
  onBack,
  onSeriesSelected,
  onAddNewSeries
}) => {
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data - same as in the hook
  const mockSeries: Series[] = [
    {
      id: '1',
      title: 'Squid Game Season 1',
      description: 'A thrilling survival series',
      totalEpisodes: 6,
      accessType: 'paid',
      price: 29,
      launchDate: '2025-06-15T11:29:00Z',
      totalViews: 500000,
      totalEarnings: 43000,
      episodes: [
        {
          id: '1',
          seriesId: '1',
          title: 'Death',
          description: 'The first episode',
          thumbnail: 'https://via.placeholder.com/150x100/8B5CF6/FFFFFF?text=Death',
          videoUrl: '/videos/death.mp4',
          uploadDate: '2025-06-15T11:29:00Z',
          views: 500000,
          conversions: 2100,
          duration: 3600,
          status: 'ready'
        }
      ],
      createdAt: '2025-06-15T11:29:00Z',
      updatedAt: '2025-06-15T11:29:00Z'
    },
    {
      id: '2',
      title: 'Tech Tutorials',
      description: 'Free programming tutorials',
      totalEpisodes: 0,
      accessType: 'free',
      launchDate: '2025-05-01T10:00:00Z',
      totalViews: 0,
      totalEarnings: 0,
      episodes: [],
      createdAt: '2025-05-01T10:00:00Z',
      updatedAt: '2025-05-01T10:00:00Z'
    }
  ];

  const loadSeries = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSeries(mockSeries);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadSeries();
  }, []);

  const handleSeriesPress = (seriesId: string) => {
    setSelectedSeriesId(seriesId);
  };

  const handleSelectPress = () => {
    const selectedSeries = series.find(s => s.id === selectedSeriesId);
    if (selectedSeries) {
      onSeriesSelected(selectedSeries);
    }
  };

  const handleAddNewPress = () => {
    onAddNewSeries();
  };

  const formatPrice = (price?: number) => {
    return price ? `₹${price}` : '';
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

  if (loading && series.length === 0) {
    return (
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 mt-12">
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-medium">Strmly studio</Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-gray-400 mt-4">Loading series...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 mt-12">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-medium">Strmly studio</Text>
        <View className="w-6" />
      </View>

      {/* Title */}
      <View className="px-4 pt-6 pb-4">
        <Text className="text-white text-lg font-medium">Select your series</Text>
      </View>

      {/* Series List */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {series.map((seriesItem) => (
          <TouchableOpacity
            key={seriesItem.id}
            onPress={() => handleSeriesPress(seriesItem.id)}
            className="bg-gray-800 rounded-2xl p-4 mb-3 flex-row items-center"
            style={{
              backgroundColor: selectedSeriesId === seriesItem.id ? '#374151' : '#1F2937'
            }}
          >
            {/* Series Icon */}
            <View className="w-12 h-12 bg-gray-600 rounded-lg items-center justify-center mr-4">
              <Ionicons name="folder" size={24} color="white" />
            </View>

            {/* Series Info */}
            <View className="flex-1">
              <Text className="text-white text-base font-medium mb-1">
                {seriesItem.title}
              </Text>
              <View className="flex-row items-center mb-1">
                <Text className="text-gray-400 text-sm">
                  Total episode: {seriesItem.totalEpisodes.toString().padStart(2, '0')}
                </Text>
                <Text className="text-gray-400 text-sm mx-2">•</Text>
                <Text className="text-gray-400 text-sm">
                  Access: {formatPrice(seriesItem.price) || 'Free'}
                </Text>
              </View>
              <Text className="text-gray-400 text-sm">
                Launch on {formatDate(seriesItem.launchDate)}
              </Text>
            </View>

            {/* Selection Indicator */}
            <View className="w-6 h-6 rounded-full border-2 border-gray-500 items-center justify-center">
              {selectedSeriesId === seriesItem.id && (
                <View className="w-3 h-3 bg-green-500 rounded-full" />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Empty State */}
        {series.length === 0 && !loading && (
          <View className="items-center justify-center py-16">
            <Ionicons name="folder-outline" size={64} color="#6B7280" />
            <Text className="text-gray-400 text-lg mt-4 mb-2">No series yet</Text>
            <Text className="text-gray-500 text-center px-8">
              Create your first series to start organizing your content
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="px-4 pb-8 pt-4">
        {selectedSeriesId ? (
          <TouchableOpacity
            onPress={handleSelectPress}
            className="bg-gray-200 rounded-full py-4 items-center"
          >
            <Text className="text-black text-lg font-medium">Select</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleAddNewPress}
            className="bg-gray-200 rounded-full py-4 items-center"
          >
            <Text className="text-black text-lg font-medium">Add new series</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SeriesSelectionScreen;