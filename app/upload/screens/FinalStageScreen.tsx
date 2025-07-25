import React, { useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Dropdown from '../components/Dropdown';
import TimePicker from '../components/TimePicker';
import ContinueButton from '../components/ContinueButton';
import { FinalStageProps } from '../types';
import { genreOptions } from '../data/dropdownOptions';

/**
 * Final Stage Screen
 * Advanced video configuration settings
 * 
 * Backend Integration Notes:
 * - Time values should be converted to seconds before sending to API
 * - Validate timing constraints (autoplay < unlock time)
 * - Consider video length validation for timing settings
 * - Implement proper error handling for upload failures
 * 
 * API Endpoints:
 * - GET /api/genres (for genre dropdown)
 * - POST /api/videos/publish (final upload submission)
 * 
 * Data Format for Backend:
 * {
 *   genre: string,
 *   autoplayStartTime: number, // in seconds
 *   unlockFromTime: number,    // in seconds
 *   ...otherVideoData
 * }
 */
const FinalStageScreen: React.FC<FinalStageProps> = ({
  formData,
  videoDetails,
  onFormChange,
  onUpload,
  onBack
}) => {
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);

  // Handle genre selection
  const handleGenreSelect = (genre: string) => {
    onFormChange({ ...formData, genre });
    setGenreDropdownOpen(false);
  };

  // Handle autoplay timing changes
  const handleAutoplayMinutesChange = (minutes: number) => {
    onFormChange({ ...formData, autoplayStartMinutes: minutes });
  };

  const handleAutoplaySecondsChange = (seconds: number) => {
    onFormChange({ ...formData, autoplayStartSeconds: seconds });
  };

  // Handle unlock timing changes
  const handleUnlockMinutesChange = (minutes: number) => {
    onFormChange({ ...formData, unlockFromMinutes: minutes });
  };

  const handleUnlockSecondsChange = (seconds: number) => {
    onFormChange({ ...formData, unlockFromSeconds: seconds });
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return formData.genre !== null;
  };

  // Calculate total seconds for validation (optional)
  const autoplayTotalSeconds = (formData.autoplayStartMinutes * 60) + formData.autoplayStartSeconds;
  const unlockTotalSeconds = (formData.unlockFromMinutes * 60) + formData.unlockFromSeconds;

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 mt-12">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-medium">Final stage</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Genre Selection */}
        <View className="mb-8">
          <Text className="text-white text-lg font-medium mb-3">Genre</Text>
          <Dropdown
            value={formData.genre}
            placeholder="Select"
            options={genreOptions}
            onSelect={handleGenreSelect}
            isOpen={genreDropdownOpen}
            onToggle={() => setGenreDropdownOpen(!genreDropdownOpen)}
          />
        </View>

        {/* Autoplay Timing */}
        <View className="mb-8">
          <Text className="text-white text-lg font-medium mb-3">Autoplay Starts At</Text>
          <TimePicker
            minutes={formData.autoplayStartMinutes}
            seconds={formData.autoplayStartSeconds}
            onMinutesChange={handleAutoplayMinutesChange}
            onSecondsChange={handleAutoplaySecondsChange}
          />
          <Text className="text-gray-400 text-sm mt-2 leading-5">
            Choose the timestamp where the video should start playing when someone scrolls to it
          </Text>
        </View>

        {/* Unlock Timing - Only show for paid videos */}
        {videoDetails.videoType === 'paid' && (
          <View className="mb-8">
            <Text className="text-white text-lg font-medium mb-3">Unlock Full Video From</Text>
            <TimePicker
              minutes={formData.unlockFromMinutes}
              seconds={formData.unlockFromSeconds}
              onMinutesChange={handleUnlockMinutesChange}
              onSecondsChange={handleUnlockSecondsChange}
            />
            <Text className="text-gray-400 text-sm mt-2 leading-5">
              The viewer can watch for free until this point. After this, they'll need to pay to continue.
            </Text>
          </View>
        )}

        {/* Validation Warning (optional) - Only show for paid videos */}
        {videoDetails.videoType === 'paid' && unlockTotalSeconds <= autoplayTotalSeconds && (
          <View className="bg-yellow-900 border border-yellow-600 rounded-lg p-3 mb-6">
            <Text className="text-yellow-200 text-sm">
              ⚠️ Unlock time should be after autoplay start time
            </Text>
          </View>
        )}

        {/* Add some bottom padding for better scrolling */}
        <View className="h-20" />
      </ScrollView>

      {/* Upload Button */}
      <ContinueButton
        title="Upload"
        onPress={onUpload}
        disabled={!isFormValid()}
      />
    </View>
  );
};

export default FinalStageScreen;