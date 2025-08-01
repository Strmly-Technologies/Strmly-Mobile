import React from 'react';
import { View, Text } from 'react-native';
import { useNotification } from '@/providers/NotificationProvider';
import Constants from 'expo-constants';

export const FCMStatusComponent: React.FC = () => {
  const { fcmToken, isInitialized } = useNotification();

  const getEnvironmentInfo = () => {
    const isExpoGo = __DEV__ && Constants.appOwnership === 'expo';
    const tokenType = fcmToken ? (
      fcmToken.includes('dev-firebase') ? 'Development Token' :
      fcmToken.includes('expo-firebase') ? 'Firebase-Compatible Token' :
      fcmToken.includes('ExponentPushToken') ? 'Expo Token' :
      'Firebase Token'
    ) : 'No Token';

    return {
      environment: isExpoGo ? 'Expo Go' : 'Development Build',
      tokenType,
      isExpoGo
    };
  };

  const { environment, tokenType, isExpoGo } = getEnvironmentInfo();

  return (
    <View style={{ 
      backgroundColor: isExpoGo ? '#FF9500' : '#34C759', 
      padding: 12, 
      margin: 10, 
      borderRadius: 8 
    }}>
      <Text style={{ color: 'white', fontWeight: 'bold', marginBottom: 5 }}>
        FCM Status: {isInitialized ? '✅ Ready' : '⏳ Initializing'}
      </Text>
      
      <Text style={{ color: 'white', fontSize: 12, marginBottom: 3 }}>
        Environment: {environment}
      </Text>
      
      <Text style={{ color: 'white', fontSize: 12, marginBottom: 3 }}>
        Token Type: {tokenType}
      </Text>
      
      {isExpoGo && (
        <Text style={{ color: 'white', fontSize: 10, marginTop: 5, fontStyle: 'italic' }}>
          ⚠️ Limited functionality in Expo Go. Use development build for full features.
        </Text>
      )}
      
      {!isExpoGo && (
        <Text style={{ color: 'white', fontSize: 10, marginTop: 5, fontStyle: 'italic' }}>
          ✅ Full FCM functionality available
        </Text>
      )}
    </View>
  );
};