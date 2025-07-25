import React, { useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ContinueButton from '../components/ContinueButton';

interface FormatSelectScreenProps {
  onFormatSelected: (format: 'episode' | 'single') => void;
  onBack: () => void;
}

/**
 * Video Format Selection Screen
 * Allows users to choose between Episode and Single video formats
 * 
 * Backend Integration Notes:
 * - Format selection affects how video is processed and displayed
 * - Episode format may require series association
 * - Single format is for standalone content
 * - This choice affects the subsequent form fields and validation
 */
const FormatSelectScreen: React.FC<FormatSelectScreenProps> = ({
  onFormatSelected,
  onBack
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'episode' | 'single' | null>(null);

  // Handle format selection
  const handleFormatSelect = (format: 'episode' | 'single') => {
    setSelectedFormat(format);
  };

  // Handle continue with selected format
  const handleContinue = () => {
    if (selectedFormat) {
      onFormatSelected(selectedFormat);
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
        <Text className="text-white text-xl font-medium">Upload</Text>
        <View className="w-6" />
      </View>

      <View className="flex-1 px-4 pt-16">
        {/* Title */}
        <Text className="text-white text-2xl font-medium text-center mb-12">
          Select Video Format
        </Text>

        {/* Format Options */}
        <View className="flex-row justify-between px-4 mb-8">
          {/* Episode Option */}
          <TouchableOpacity
            onPress={() => handleFormatSelect('episode')}
            className={`flex-1 mr-3 bg-gray-800 rounded-2xl p-6 items-center ${
              selectedFormat === 'episode' ? 'border-2 border-blue-500' : ''
            }`}
          >
            <View className="w-16 h-16 mb-4 items-center justify-center">
              {/* Episode Icon - Multiple rectangles representing series */}
              <View className="relative">
                <View className="w-12 h-8 border-2 border-white rounded opacity-30 absolute -top-1 -left-1" />
                <View className="w-12 h-8 border-2 border-white rounded opacity-60 absolute top-0 left-0" />
                <View className="w-12 h-8 border-2 border-white rounded" />
              </View>
            </View>
            <Text className="text-white text-lg font-medium">Episode</Text>
          </TouchableOpacity>

          {/* Single Option */}
          <TouchableOpacity
            onPress={() => handleFormatSelect('single')}
            className={`flex-1 ml-3 bg-gray-800 rounded-2xl p-6 items-center ${
              selectedFormat === 'single' ? 'border-2 border-blue-500' : ''
            }`}
          >
            <View className="w-16 h-16 mb-4 items-center justify-center">
              {/* Single Icon - Single rectangle */}
              <View className="w-12 h-8 border-2 border-white rounded" />
            </View>
            <Text className="text-white text-lg font-medium">Single</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <Text className="text-gray-400 text-center text-base leading-6 px-4">
          Select "Episode" for series or "Single" for one-time content.
        </Text>
      </View>

      {/* Continue Button - Only show when format is selected */}
      {selectedFormat && (
        <ContinueButton
          title="Continue"
          onPress={handleContinue}
        />
      )}
    </View>
  );
};

export default FormatSelectScreen;