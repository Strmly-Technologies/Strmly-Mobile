import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ContinueButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Reusable continue/submit button component
 * Used across all upload flow screens for consistent styling and behavior
 */
const ContinueButton: React.FC<ContinueButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-full py-4 items-center mx-4 mb-8 ${
        disabled || loading ? 'bg-gray-400' : 'bg-gray-200'
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#000000" />
      ) : (
        <Text className="text-black text-lg font-medium">{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default ContinueButton;