import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  size?: number;
}

/**
 * Animated circular progress indicator with dotted border
 * Shows upload progress with smooth animations
 * 
 * Backend Integration Notes:
 * - progress prop should be updated from upload progress API
 * - Consider using WebSocket or polling for real-time progress updates
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  size = 120
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const rotationValue = useRef(new Animated.Value(0)).current;

  // Animate progress changes
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Continuous rotation animation for the dotted border
  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(rotationValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    return () => rotateAnimation.stop();
  }, []);

  // Rotation animation for dotted border
  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Progress width animation
  const progressWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, size - 20],
  });

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      {/* Dotted border with rotation animation */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: 'white',
          borderStyle: 'dashed',
          opacity: 0.3,
          transform: [{ rotate: rotation }],
        }}
      />

      {/* Progress circle background */}
      <View
        style={{
          width: size - 20,
          height: size - 20,
          borderRadius: (size - 20) / 2,
          borderWidth: 3,
          borderColor: '#333333',
          backgroundColor: 'transparent',
          position: 'absolute',
        }}
      />

      {/* Progress indicator (simplified) */}
      <View
        style={{
          width: size - 20,
          height: size - 20,
          borderRadius: (size - 20) / 2,
          position: 'absolute',
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: progressWidth,
            backgroundColor: 'white',
            opacity: 0.8,
          }}
        />
      </View>

      {/* Upload arrow icon */}
      <View className="absolute items-center justify-center">
        <Ionicons name="arrow-up" size={32} color="white" />
      </View>

      {/* Progress percentage */}
      <View className="absolute bottom-2">
        <Text className="text-white text-xs font-medium">
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
};

export default ProgressIndicator;