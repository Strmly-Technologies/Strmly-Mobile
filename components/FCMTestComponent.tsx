import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNotification } from '@/providers/NotificationProvider';
import { useAuthStore } from '@/store/useAuthStore';
import Constants from 'expo-constants';

export const FCMTestComponent: React.FC = () => {
  const { fcmToken, isInitialized, sendTokenToBackend, scheduleNotification } = useNotification();
  const { token } = useAuthStore();

  const handleSendToken = async () => {
    if (!token) {
      Alert.alert('Error', 'No auth token available');
      return;
    }

    try {
      const success = await sendTokenToBackend(token);
      Alert.alert(
        success ? 'Success' : 'Failed',
        success ? 'Firebase-compatible FCM token sent successfully' : 'Failed to send FCM token'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send FCM token');
    }
  };

  const handleTestLocalNotification = async () => {
    try {
      await scheduleNotification({
        title: 'Test Notification',
        body: 'This is a test notification from Strmly!',
        data: { screen: 'home' }
      });
      Alert.alert('Success', 'Local notification scheduled');
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule notification');
    }
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#1a1a1a', margin: 10, borderRadius: 8 }}>
      <Text style={{ color: 'white', fontSize: 18, marginBottom: 10 }}>FCM Test Panel</Text>
      
      <Text style={{ color: '#ccc', marginBottom: 5 }}>
        Status: {isInitialized ? '✅ FCM Service Ready' : '❌ Not Initialized'}
      </Text>
      
      <Text style={{ color: '#ccc', marginBottom: 5 }}>
        Environment: {Constants.appOwnership === 'expo' ? '📱 Expo Go (Limited)' : '🏗️ Development Build'}
      </Text>
      
      <Text style={{ color: '#ccc', marginBottom: 5 }}>
        Token Type: {fcmToken ? (
          fcmToken.includes('ExponentPushToken') ? 'Expo Token' : 
          fcmToken.includes('dev-firebase') ? '🔧 Dev Firebase Token' :
          '🔥 Firebase-Compatible Token'
        ) : 'No token'}
      </Text>
      
      <Text style={{ color: '#ccc', marginBottom: 10, fontSize: 10 }}>
        Token: {fcmToken ? `${fcmToken.substring(0, 30)}...` : 'No token'}
      </Text>

      <TouchableOpacity
        onPress={handleSendToken}
        style={{
          backgroundColor: '#007AFF',
          padding: 12,
          borderRadius: 6,
          marginBottom: 10,
          opacity: !token ? 0.5 : 1
        }}
        disabled={!token}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Send Firebase-Compatible Token
        </Text>
      </TouchableOpacity>

      {Constants.appOwnership !== 'expo' && (
        <TouchableOpacity
          onPress={handleTestLocalNotification}
          style={{
            backgroundColor: '#34C759',
            padding: 12,
            borderRadius: 6,
            opacity: !isInitialized ? 0.5 : 1
          }}
          disabled={!isInitialized}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            Test Local Notification
          </Text>
        </TouchableOpacity>
      )}

      {Constants.appOwnership === 'expo' && (
        <View style={{
          backgroundColor: '#FF9500',
          padding: 12,
          borderRadius: 6,
          marginTop: 10
        }}>
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>
            ⚠️ Local notifications not available in Expo Go
          </Text>
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 10, marginTop: 5 }}>
            Use development build for full functionality
          </Text>
        </View>
      )}
    </View>
  );
};