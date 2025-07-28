import React, { useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormField from '../components/FormField';
import Dropdown from '../components/Dropdown';
import ContinueButton from '../components/ContinueButton';
import { VideoDetailProps } from '../types';
import { communityOptions, formatOptions, videoTypeOptions } from '../data/dropdownOptions';

/**
 * Video Detail Screen
 * Multi-step form for video metadata configuration
 * 
 * Backend Integration Notes:
 * - Form data should be validated on both client and server
 * - Consider auto-saving drafts as user types
 * - Implement proper error handling for API failures
 * - Add loading states for dropdown data fetching
 * 
 * API Endpoints:
 * - GET /api/communities (for community dropdown)
 * - GET /api/formats (for format dropdown)
 * - POST /api/videos/draft (for saving draft data)
 */
const VideoDetailScreen: React.FC<VideoDetailProps> = ({
  step,
  formData,
  onFormChange,
  onContinue,
  onBack,
  selectedSeries,
  videoFormat
}) => {
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);
  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);
  const [videoTypeDropdownOpen, setVideoTypeDropdownOpen] = useState(false);

  // Handle title change
  const handleTitleChange = (title: string) => {
    onFormChange({ ...formData, title });
  };

  // Handle community selection
  const handleCommunitySelect = (community: string) => {
    onFormChange({ ...formData, community });
    setCommunityDropdownOpen(false);
  };

  // Handle format selection
  const handleFormatSelect = (format: 'Netflix' | 'Youtube') => {
    onFormChange({ ...formData, format });
    setFormatDropdownOpen(false);
  };

  // Handle video type selection
  const handleVideoTypeSelect = (videoType: 'free' | 'paid') => {
    onFormChange({ ...formData, videoType });
    setVideoTypeDropdownOpen(false);
  };

  // Check if current step is valid
  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.title.trim() !== '' && formData.community !== null;
      case 2:
        return formData.title.trim() !== '' &&
          formData.community !== null &&
          formData.format !== null;
      case 3:
        return formData.title.trim() !== '' &&
          formData.community !== null &&
          formData.format !== null &&
          formData.videoType !== null;
      default:
        return false;
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 mt-12">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-medium">Video detail</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Series Information - Show for episodes */}
        {videoFormat === 'episode' && selectedSeries && (
          <View className="mb-8 bg-gray-800 rounded-2xl p-4">
            <Text className="text-white text-lg font-medium mb-2">Selected Series</Text>
            <View className="flex-row items-center">
              <View className="w-10 h-8 border-2 border-white rounded mr-3 items-center justify-center">
                <View className="w-6 h-4 border border-white rounded" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-medium">{selectedSeries.title}</Text>
                <Text className="text-gray-400 text-sm">
                  {selectedSeries.accessType === 'paid' ? `₹${selectedSeries.price}` : 'Free'} •
                  {selectedSeries.totalEpisodes} episodes
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Title Field */}
        <FormField
          label={videoFormat === 'episode' ? 'Episode Title' : 'Title'}
          value={formData.title}
          placeholder={videoFormat === 'episode' ? 'Episode 1' : 'Bank name'}
          onChangeText={handleTitleChange}
        />

        {/* Community Dropdown */}
        <View className="mb-8">
          <Text className="text-white text-lg font-medium mb-3">Community</Text>
          <Dropdown
            value={formData.community}
            placeholder="Select"
            options={communityOptions}
            onSelect={handleCommunitySelect}
            isOpen={communityDropdownOpen}
            onToggle={() => setCommunityDropdownOpen(!communityDropdownOpen)}
          />
        </View>

        {/* Format Dropdown - Show from step 2 onwards */}
        {step >= 2 && (
          <View className="mb-8">
            <Text className="text-white text-lg font-medium mb-3">Format That Fits Your Content</Text>
            <Dropdown
              value={formData.format}
              placeholder="Select"
              options={formatOptions}
              onSelect={handleFormatSelect}
              isOpen={formatDropdownOpen}
              onToggle={() => setFormatDropdownOpen(!formatDropdownOpen)}
            />
          </View>
        )}

        {/* Video Type Dropdown - Show from step 3 onwards */}
        {step >= 3 && (
          <View className="mb-8">
            <Text className="text-white text-lg font-medium mb-3">Video Type</Text>
            <Dropdown
              value={formData.videoType}
              placeholder="Select"
              options={videoTypeOptions}
              onSelect={handleVideoTypeSelect}
              isOpen={videoTypeDropdownOpen}
              onToggle={() => setVideoTypeDropdownOpen(!videoTypeDropdownOpen)}
            />
          </View>
        )}

        {/* Add some bottom padding for better scrolling */}
        <View className="h-20" />
      </ScrollView>

      {/* Continue Button */}
      <ContinueButton
        title="Continue"
        onPress={onContinue}
        disabled={!isStepValid()}
      />
    </View>
  );
};

export default VideoDetailScreen;