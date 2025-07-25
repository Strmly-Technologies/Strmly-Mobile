import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface FormFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  error?: string;
}

/**
 * Reusable form field component for text inputs
 * Used across video upload forms for consistent styling
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  placeholder,
  onChangeText,
  error
}) => {
  return (
    <View className="mb-8">
      <Text className="text-white text-lg font-medium mb-3">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666666"
        className={`bg-transparent border rounded-xl px-6 py-4 text-white text-lg ${error ? 'border-red-500' : 'border-gray-600'
          }`}
        style={{ minHeight: 56 }}
      />
      {error && (
        <Text className="text-red-500 text-base mt-2">{error}</Text>
      )}
    </View>
  );
};

export default FormField;