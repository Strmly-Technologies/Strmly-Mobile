import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Series } from '../types';
import { CONFIG } from '@/Constants/config';
import { useAuthStore } from '@/store/useAuthStore';

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
  const [series, setSeries] = useState<any[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSeries = async (showRefreshIndicator = true) => {
    if (showRefreshIndicator) {
      setLoading(true);
    }
    try {
      // Get token from auth store
      const { token } = useAuthStore.getState();

      // Check if token exists and is valid
      if (!token) {
        console.error('Authentication token is missing');
        setSeries([]);
        setLoading(false);
        return;
      }

      // Try to fetch user's series
      // Using a different endpoint that's known to work better with the current auth system
      const response = await fetch(`${CONFIG.API_BASE_URL}/series/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('User series response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch series');
      }

      setSeries(result.data || []);
    } catch (error) {
      console.error('Error fetching series:', error);
      setSeries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSeries();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSeries(false);
  }, []);

  const handleSeriesPress = (seriesId: string) => {
    setSelectedSeriesId(seriesId);
  };

  const handleSelectPress = () => {
    const selectedSeries = series.find(s => s._id === selectedSeriesId);
    if (selectedSeries) {
      // Convert backend format to frontend format
      const frontendSeries: Series = {
        id: selectedSeries._id,
        title: selectedSeries.title,
        description: selectedSeries.description,
        totalEpisodes: selectedSeries.total_episodes || 0,
        accessType: selectedSeries.type?.toLowerCase() === 'paid' ? 'paid' : 'free',
        price: selectedSeries.price,
        launchDate: selectedSeries.release_date || selectedSeries.createdAt,
        totalViews: selectedSeries.views || 0,
        totalEarnings: selectedSeries.total_earned || 0,
        episodes: [],
        createdAt: selectedSeries.createdAt,
        updatedAt: selectedSeries.updatedAt
      };
      onSeriesSelected(frontendSeries);
    }
  };

  const handleAddNewPress = () => {
    onAddNewSeries();
  };

  const formatPrice = (price?: number) => {
    return price ? `₹${price}` : 'Free';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', '');
  };

  if (loading && series.length === 0) {
    return (
      <View className="flex-1 bg-black">

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

  console.log('🎬 RENDERING SeriesSelectionScreen - You should see this in logs!');
  
  return (
    <View className="flex-1 bg-black" style={{ backgroundColor: 'red' }}>

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
        <Text className="text-red-400 text-xs mt-1">DEBUG: SeriesSelectionScreen - Updated</Text>
      </View>

      {/* Series List */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={["#FFFFFF"]}
          />
        }
      >
        {series.map((seriesItem) => (
          <TouchableOpacity
            key={seriesItem._id}
            onPress={() => handleSeriesPress(seriesItem._id)}
            className="bg-gray-800 rounded-2xl p-4 mb-3 flex-row items-center"
            style={{
              backgroundColor: selectedSeriesId === seriesItem._id ? '#374151' : '#1F2937'
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
                  Total episode: {(seriesItem.total_episodes || 0).toString().padStart(2, '0')}
                </Text>
                <Text className="text-gray-400 text-sm mx-2">•</Text>
                <Text className="text-gray-400 text-sm">
                  Access: {formatPrice(seriesItem.price)}
                </Text>
              </View>
              <Text className="text-gray-400 text-sm">
                Launch on {formatDate(seriesItem.release_date || seriesItem.createdAt)}
              </Text>
            </View>

            {/* Radio Button */}
            <View className="w-6 h-6 rounded-full border-2 border-gray-500 items-center justify-center">
              {selectedSeriesId === seriesItem._id && (
                <View className="w-3 h-3 bg-white rounded-full" />
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
        <Text className="text-yellow-400 text-xs mb-2">
          DEBUG: selectedSeriesId = {selectedSeriesId || 'null'}
        </Text>
        {selectedSeriesId && (
          <TouchableOpacity
            onPress={handleSelectPress}
            className="bg-blue-500 rounded-full py-4 items-center"
          >
            <Text className="text-white text-lg font-medium">Continue</Text>
          </TouchableOpacity>
        )}
        {!selectedSeriesId && (
          <Text className="text-gray-400 text-center">No button should show when no series selected</Text>
        )}
      </View>
    </View>
  );
};

export default SeriesSelectionScreen;