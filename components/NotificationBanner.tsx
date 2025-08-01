import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';

interface NotificationBannerProps {
  notification: Notifications.Notification | null;
  onDismiss?: () => void;
  onPress?: (data: any) => void;
}

const { width } = Dimensions.get('window');

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
  onPress,
}) => {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Slide down
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        dismissBanner();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const dismissBanner = () => {
    Animated.spring(slideAnim, {
      toValue: -100,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setIsVisible(false);
      onDismiss?.();
    });
  };

  const handlePress = () => {
    const data = notification?.request.content.data;
    onPress?.(data);
    dismissBanner();
  };

  if (!notification || !isVisible) {
    return null;
  }

  const { title, body } = notification.request.content;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        zIndex: 1000,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg"
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="text-white font-semibold text-base mb-1">
              {title}
            </Text>
            <Text className="text-gray-300 text-sm leading-5">
              {body}
            </Text>
          </View>
          <TouchableOpacity
            onPress={dismissBanner}
            className="p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};