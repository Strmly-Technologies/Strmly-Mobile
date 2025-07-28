import React, { useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import ContinueButton from '../components/ContinueButton';

interface FileSelectScreenProps {
  onFileSelected: (file: any) => void;
  onBack: () => void;
}

/**
 * File Selection Screen
 * Allows users to select video files for upload
 * 
 * Backend Integration Notes:
 * - Validate file types and sizes on both client and server
 * - Consider implementing file compression for large videos
 * - Add support for multiple video formats (mp4, mov, avi, etc.)
 * - Implement proper error handling for file selection failures
 * 
 * File Validation:
 * - Max file size: 500MB (adjust based on your requirements)
 * - Supported formats: mp4, mov, avi, mkv
 * - Duration limits: 30 seconds to 5 hours
 */
const FileSelectScreen: React.FC<FileSelectScreenProps> = ({
  onFileSelected,
  onBack
}) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Handle file selection
  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Basic file validation
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size && file.size > maxSize) {
          Alert.alert('File Too Large', 'Please select a video file smaller than 500MB');
          return;
        }

        console.log('Selected file:', file);
        setSelectedFile(file);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select file. Please try again.');
      console.error('File selection error:', error);
    }
  };

  // Handle continue with selected file
  const handleContinue = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
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

      <View className="flex-1 px-4 pt-8">
        {/* Video Preview Area */}
        <TouchableOpacity
          onPress={handleFileSelect}
          className="bg-gray-800 rounded-2xl h-64 items-center justify-center mb-6"
          style={{
            backgroundColor: selectedFile ? '#4A5568' : '#2D3748',
          }}
        >
          {selectedFile ? (
            <View className="items-center">
              <Ionicons name="videocam" size={48} color="white" />
              <Text className="text-white text-base mt-2 text-center px-4">
                {selectedFile.name}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                {selectedFile.size ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : ''}
              </Text>
            </View>
          ) : (
            <View className="items-center">
              <View className="w-16 h-16 bg-gray-600 rounded-full items-center justify-center mb-4">
                <Ionicons name="arrow-up" size={32} color="white" />
              </View>
              <Text className="text-white text-base">Tap to select video</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Info Text */}
        <Text className="text-gray-400 text-center text-base mb-8 leading-6">
          You can upload videos of any length — 30 sec,{'\n'}
          5 min, 1 hours or more.
        </Text>

        {/* Upload File Button */}
        {!selectedFile && (
          <TouchableOpacity
            onPress={handleFileSelect}
            className="bg-gray-200 rounded-full py-4 items-center mb-6"
          >
            <Text className="text-black text-lg font-medium">Upload file</Text>
          </TouchableOpacity>
        )}

        {/* AI Info Text */}
        <Text className="text-gray-400 text-center text-sm leading-5 px-4">
          Our smart AI detector reshapes your video to look great in both portrait and landscape views—so every viewer gets the best experience.
        </Text>
      </View>

      {/* Continue Button - Only show when file is selected */}
      {selectedFile && (
        <ContinueButton
          title="Continue"
          onPress={handleContinue}
        />
      )}
    </View>
  );
};

export default FileSelectScreen;