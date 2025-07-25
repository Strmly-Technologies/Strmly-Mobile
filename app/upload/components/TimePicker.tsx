import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { TimePickerProps } from '../types';

/**
 * TimePicker Component
 * Dual input fields for minutes and seconds selection
 * 
 * Backend Integration Notes:
 * - Time values are stored as separate minutes and seconds
 * - Convert to total seconds when sending to backend: (minutes * 60) + seconds
 * - Validate time ranges on both frontend and backend
 * - Consider maximum video length limits
 */
const TimePicker: React.FC<TimePickerProps> = ({
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange
}) => {
  // Handle minutes input change with validation
  const handleMinutesChange = (text: string) => {
    const numValue = parseInt(text) || 0;
    // Limit minutes to reasonable range (0-999)
    if (numValue >= 0 && numValue <= 999) {
      onMinutesChange(numValue);
    }
  };

  // Handle seconds input change with validation
  const handleSecondsChange = (text: string) => {
    const numValue = parseInt(text) || 0;
    // Limit seconds to 0-59
    if (numValue >= 0 && numValue <= 59) {
      onSecondsChange(numValue);
    }
  };

  return (
    <View className="flex-row items-center space-x-4">
      {/* Minutes Input */}
      <View className="flex-row items-center">
        <TextInput
          value={minutes.toString().padStart(2, '0')}
          onChangeText={handleMinutesChange}
          keyboardType="numeric"
          maxLength={3}
          className="bg-transparent border border-gray-600 rounded-lg px-3 py-2 text-white text-base text-center w-16"
        />
        <Text className="text-gray-400 text-base ml-2">min</Text>
      </View>

      {/* Seconds Input */}
      <View className="flex-row items-center">
        <TextInput
          value={seconds.toString().padStart(2, '0')}
          onChangeText={handleSecondsChange}
          keyboardType="numeric"
          maxLength={2}
          className="bg-transparent border border-gray-600 rounded-lg px-3 py-2 text-white text-base text-center w-16"
        />
        <Text className="text-gray-400 text-base ml-2">sec</Text>
      </View>
    </View>
  );
};

export default TimePicker;