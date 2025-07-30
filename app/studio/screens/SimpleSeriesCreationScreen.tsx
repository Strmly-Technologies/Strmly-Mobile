import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Series } from '../types';
import { CONFIG } from '../../../Constants/config';

// Genre options based on the backend enum
const genreOptions = [
  { label: 'Action', value: 'Action' },
  { label: 'Comedy', value: 'Comedy' },
  { label: 'Drama', value: 'Drama' },
  { label: 'Horror', value: 'Horror' },
  { label: 'Sci-Fi', value: 'Sci-Fi' },
  { label: 'Romance', value: 'Romance' },
  { label: 'Documentary', value: 'Documentary' },
  { label: 'Thriller', value: 'Thriller' },
  { label: 'Fantasy', value: 'Fantasy' },
  { label: 'Animation', value: 'Animation' }
];

interface SimpleSeriesCreationScreenProps {
  onBack: () => void;
  onSeriesCreated: (series: Series) => void;
}

/**
 * Simple Series Creation Screen
 * Simplified version without useSeriesManagement hook to test duplicate screen issue
 */
const SimpleSeriesCreationScreen: React.FC<SimpleSeriesCreationScreenProps> = ({
  onBack,
  onSeriesCreated
}) => {
  // Series creation form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'free' | 'paid' | null>(null);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Two-step flow state
  const [currentStep, setCurrentStep] = useState<'creation' | 'details'>('creation');

  // Video detail form state
  const [videoDetails, setVideoDetails] = useState({
    description: '',
    genre: null as string | null,
    language: 'english' // Default language
  });

  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);

  const handleClose = () => {
    onBack();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Series title is required';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Series title must be 100 characters or less';
    }

    if (!type) {
      newErrors.type = 'Series type is required';
    }

    if (type === 'paid') {
      if (!price || price <= 0) {
        newErrors.price = 'Price must be greater than 0 for paid series';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Move to details step
    setTimeout(() => {
      setLoading(false);
      setCurrentStep('details');
    }, 500);
  };

  const handleContinue = async () => {
    if (!isVideoDetailsValid()) {
      return;
    }

    setLoading(true);

    try {
      const seriesData = {
        title: title.trim(),
        description: videoDetails.description.trim(),
        genre: videoDetails.genre!,
        language: videoDetails.language,
        type: type === 'free' ? 'Free' : 'Paid',
        price: type === 'paid' ? price : 0
      };

      console.log("Creating series with data:", seriesData);

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/series/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODg0Yzc0YWU3M2Q4ZDRlZjY3YjAyZTQiLCJpYXQiOjE3NTM1MzIyMzYsImV4cCI6MTc1NjEyNDIzNn0._pqT9psCN1nR5DJpB60HyA1L1pp327o1fxfZPO4BY3M'
        },
        body: JSON.stringify(seriesData)
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (response.ok && result.data) {
        // Convert backend response to frontend Series format
        const newSeries: Series = {
          id: result.data._id,
          title: result.data.title,
          description: result.data.description,
          totalEpisodes: result.data.total_episodes || 0,
          accessType: result.data.type.toLowerCase() as 'free' | 'paid',
          price: result.data.price,
          launchDate: result.data.release_date || result.data.createdAt,
          totalViews: result.data.views || 0,
          totalEarnings: result.data.total_earned || 0,
          episodes: [],
          createdAt: result.data.createdAt,
          updatedAt: result.data.updatedAt
        };

        console.log("Series created successfully:", newSeries);
        setLoading(false);
        onSeriesCreated(newSeries);
      } else {
        console.error("API Error:", result);
        setLoading(false);
        setErrors({ general: result.error || 'Failed to create series' });
      }
    } catch (error) {
      console.error("Network Error:", error);
      setLoading(false);
      setErrors({ general: 'Network error occurred' });
    }
  };

  const handleBackFromDetails = () => {
    setCurrentStep('creation');
  };

  const handleTypeSelect = (selectedType: 'free' | 'paid') => {
    setType(selectedType);
    setPrice(selectedType === 'free' ? undefined : price);
    setShowTypeDropdown(false);
  };

  const getTypeDisplayText = () => {
    if (!type) return 'Select';
    return type === 'free' ? 'Free' : 'Paid';
  };

  // Render series creation step
  const renderSeriesCreationStep = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 mt-12">
          <TouchableOpacity onPress={handleBackFromDetails}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-medium">Video detail</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 px-4 pt-6">
          {/* Description Field */}
          <View className="mb-8">
            <Text className="text-white text-lg font-medium mb-3">Description</Text>
            <TextInput
              value={videoDetails.description}
              onChangeText={(description) => handleVideoDetailChange('description', description)}
              placeholder="Enter series description..."
              placeholderTextColor="#9CA3AF"
              className="bg-black border border-gray-600 text-white px-4 py-4 rounded-xl text-base"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={1000}
            />
          </View>

          {/* Genre Dropdown */}
          <View className="mb-8">
            <Text className="text-white text-lg font-medium mb-3">Genre</Text>
            <TouchableOpacity
              onPress={() => setGenreDropdownOpen(!genreDropdownOpen)}
              className="bg-black border border-gray-600 rounded-xl px-4 py-4 flex-row items-center justify-between"
            >
              <Text className={`text-base ${videoDetails.genre ? 'text-white' : 'text-gray-400'}`}>
                {videoDetails.genre || 'Select Genre'}
              </Text>
              <Ionicons
                name={genreDropdownOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>

            {genreDropdownOpen && (
              <View className="bg-gray-800 border border-gray-600 rounded-xl mt-2 max-h-48">
                <ScrollView>
                  {genreOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        handleVideoDetailChange('genre', option.value);
                        setGenreDropdownOpen(false);
                      }}
                      className="px-4 py-3 border-b border-gray-600"
                    >
                      <Text className="text-white text-base">{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Add some bottom padding for better scrolling */}
          <View className="h-20" />
        </ScrollView>

        {/* Continue Button */}
        <View className="px-4 pb-8 pt-4">
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isVideoDetailsValid() || loading}
            className="bg-gray-200 rounded-full py-4 items-center"
            style={{
              backgroundColor: (!isVideoDetailsValid() || loading) ? '#6B7280' : '#E5E7EB'
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="black" />
            ) : (
              <Text className="text-black text-lg font-medium">Continue</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* General Error */}
        {errors.general && (
          <View className="px-4 pb-4">
            <Text className="text-red-400 text-sm text-center">{errors.general}</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );

  // Handle video detail form changes
  const handleVideoDetailChange = (field: string, value: string) => {
    setVideoDetails(prev => ({ ...prev, [field]: value }));
  };

  // Check if video details form is valid
  const isVideoDetailsValid = () => {
    return videoDetails.description.trim() !== '' &&
      videoDetails.genre !== null;
  };

  // Render video details step
  const renderVideoDetailsStep = () => (

    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 mt-12">
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <View className="w-6" />
        </View>

        <View className="flex-1 justify-center px-4">
          {/* Centered Content */}
          <View className="items-center">
            {/* Title */}
            <Text className="text-white text-xl font-medium mb-8">Give your series name</Text>

            {/* Series Name Input */}
            <View className="items-center mb-8">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Series 1"
                placeholderTextColor="#9CA3AF"
                className="text-white text-3xl font-medium text-center pb-2 mb-2"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#6B7280',
                  width: Math.max(120, (title || 'Series 1').length * 20), // Dynamic width based on text length
                  minWidth: 120
                }}
                maxLength={100}
                autoFocus
              />
              {errors.title && (
                <Text className="text-red-400 text-sm text-center mt-2">{errors.title}</Text>
              )}
            </View>

            {/* Type Selection */}
            <View className="w-full max-w-sm mb-6">
              <Text className="text-white text-base font-medium mb-4">Type</Text>

              {/* Type Dropdown */}
              <TouchableOpacity
                onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                className="bg-black border border-gray-600 rounded-xl px-6 py-4 flex-row items-center justify-between"
                style={{ minHeight: 56 }}
              >
                <Text className={`text-lg ${type ? 'text-white' : 'text-gray-400'}`}>
                  {getTypeDisplayText()}
                </Text>
                <Ionicons
                  name={showTypeDropdown ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>

              {/* Dropdown Options */}
              {showTypeDropdown && (
                <View
                  className="absolute top-20 left-0 right-0 border border-gray-500 z-10 max-h-64"
                  style={{
                    backgroundColor: '#2b2b2b',
                    borderRadius: 16
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleTypeSelect('free')}
                    className="px-6 py-4 border-b border-gray-500"
                    style={{
                      minHeight: 56,
                      backgroundColor: type === 'free' ? '#404040' : '#2b2b2b',
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                    }}
                  >
                    <Text className="text-white text-lg">Free</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleTypeSelect('paid')}
                    className="px-6 py-4"
                    style={{
                      minHeight: 56,
                      backgroundColor: type === 'paid' ? '#404040' : '#2b2b2b',
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    }}
                  >
                    <Text className="text-white text-lg">Paid</Text>
                  </TouchableOpacity>
                </View>
              )}

              {errors.type && (
                <Text className="text-red-400 text-sm mt-2">{errors.type}</Text>
              )}
            </View>

            {/* Price Input - Only show for paid series */}
            {type === 'paid' && (
              <View className="w-full max-w-sm mb-6">
                <Text className="text-white text-base font-medium mb-4">Price</Text>
                <TextInput
                  value={price?.toString() || ''}
                  onChangeText={(priceText) => setPrice(priceText ? parseInt(priceText) : undefined)}
                  placeholder="₹30"
                  placeholderTextColor="#9CA3AF"
                  className="bg-black border border-gray-600 text-white px-6 py-4 rounded-xl text-lg"
                  keyboardType="numeric"
                  style={{ minHeight: 56 }}
                />
                {errors.price && (
                  <Text className="text-red-400 text-sm mt-2">{errors.price}</Text>
                )}
              </View>
            )}

            {/* Create Button - Smaller width as shown in image */}
            <View className="items-center mt-4">
              <TouchableOpacity
                onPress={handleCreate}
                disabled={loading}
                className="bg-gray-200 rounded-full py-4 px-12 items-center"
                style={{
                  backgroundColor: loading ? '#6B7280' : '#E5E7EB',
                  width: 160 // Smaller width to match the image
                }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="black" />
                ) : (
                  <Text className="text-black text-lg font-medium">Create</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* General Error */}
            {errors.general && (
              <View className="w-full mt-4">
                <Text className="text-red-400 text-sm text-center">{errors.general}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  // Main render - show appropriate step
  return currentStep === 'creation' ? renderSeriesCreationStep() : renderVideoDetailsStep();
};

export default SimpleSeriesCreationScreen;