import React, { useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';
import ProgressIndicator from '../components/ProgressIndicator';
import { UploadProgressProps } from '../types';

/**
 * Upload Progress Screen
 * Shows animated progress indicator while video is uploading
 * 
 * Backend Integration Notes:
 * - Replace mock progress with real upload progress from your API
 * - Consider using multipart upload for large video files
 * - Implement proper error handling for upload failures
 * - Add retry mechanism for failed uploads
 * 
 * API Endpoints needed:
 * - POST /api/videos/upload (multipart form data)
 * - GET /api/videos/upload-progress/:uploadId (for progress tracking)
 */
const UploadProgressScreen: React.FC<UploadProgressProps> = ({
  progress,
  onUploadComplete
}) => {
  // Auto-navigate when upload is complete
  useEffect(() => {
    if (progress >= 100) {
      // Small delay to show 100% completion before navigating
      const timer = setTimeout(() => {
        onUploadComplete();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [progress, onUploadComplete]);

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View className="flex-1 items-center justify-center px-8">
        {/* Progress Indicator */}
        <ProgressIndicator progress={progress} />
        
        {/* Upload Status Text */}
        <Text className="text-white text-xl font-medium text-center mt-8 mb-4">
          Your video is uploading
        </Text>
        
        {/* Instruction Text */}
        <Text className="text-gray-400 text-base text-center leading-6">
          Keep the app open and screen on
        </Text>
        
        {/* Progress Percentage (for debugging - remove in production) */}
        {__DEV__ && (
          <Text className="text-gray-500 text-sm mt-4">
            {Math.round(progress)}%
          </Text>
        )}
      </View>
    </View>
  );
};

export default UploadProgressScreen;