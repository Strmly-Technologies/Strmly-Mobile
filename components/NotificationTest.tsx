import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNotification } from '../providers/NotificationProvider';

export const NotificationTest: React.FC = () => {
  const { fcmToken, isInitialized, scheduleNotification } = useNotification();

  const testLocalNotification = async () => {
    await scheduleNotification({
      title: "Test Notification",
      body: "This is a test notification from your app!",
      data: { 
        type: "video", 
        videoId: "123",
        screen: "/(dashboard)/long/VideoFeed"
      },
    });
  };

  return (
    <View className="p-4 bg-gray-800 rounded-lg m-4">
      <Text className="text-white text-lg font-bold mb-2">FCM Status</Text>
      <Text className="text-gray-300 mb-2">
        Initialized: {isInitialized ? "✅" : "❌"}
      </Text>
      <Text className="text-gray-300 mb-4">
        Token: {fcmToken ? "✅ Available" : "❌ Not available"}
      </Text>
      
      <TouchableOpacity
        onPress={testLocalNotification}
        className="bg-blue-600 p-3 rounded-lg"
        disabled={!isInitialized}
      >
        <Text className="text-white text-center font-semibold">
          Test Local Notification
        </Text>
      </TouchableOpacity>
    </View>
  );
};