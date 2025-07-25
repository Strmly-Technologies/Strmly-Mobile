import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSeriesManagement } from '../hooks/useSeriesManagement';

interface SeriesCreationScreenProps {
  onBack: () => void;
  onSeriesCreated: (series: any) => void;
}

/**
 * Series Creation Screen
 * Full screen for creating new series with title, type, and price configuration
 */
const SeriesCreationScreen: React.FC<SeriesCreationScreenProps> = ({
  onBack,
  onSeriesCreated
}) => {
  const {
    state,
    updateFormData,
    createSeries,
    clearErrors
  } = useSeriesManagement();

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const handleClose = () => {
    clearErrors();
    onBack();
  };

  const handleCreate = async () => {
    const success = await createSeries();
    if (success && state.series.length > 0) {
      // Get the newly created series (last one in the array)
      const newSeries = state.series[state.series.length - 1];
      onSeriesCreated(newSeries);
    }
  };

  const handleTypeSelect = (type: 'free' | 'paid') => {
    updateFormData({
      type,
      price: type === 'free' ? undefined : state.formData.price
    });
    setShowTypeDropdown(false);
  };

  const getTypeDisplayText = () => {
    if (!state.formData.type) return 'Select';
    return state.formData.type === 'free' ? 'Free' : 'Paid';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 mt-12">
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 px-4 pt-16" showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View className="items-center mb-12">
            <Text className="text-white text-xl font-medium mb-8">Give your series name</Text>

            {/* Series Name Input */}
            <View className="w-full max-w-xs">
              <TextInput
                value={state.formData.title}
                onChangeText={(title) => updateFormData({ title })}
                placeholder="Series 1"
                placeholderTextColor="#9CA3AF"
                className="text-white text-2xl font-medium text-center border-b border-gray-600 pb-2 mb-2"
                maxLength={100}
                autoFocus
              />
              {state.errors.title && (
                <Text className="text-red-400 text-sm text-center mt-2">{state.errors.title}</Text>
              )}
            </View>
          </View>

          {/* Type Selection */}
          <View className="mb-8">
            <Text className="text-white text-base font-medium mb-4">Type</Text>

            {/* Type Dropdown */}
            <TouchableOpacity
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-4 flex-row items-center justify-between"
            >
              <Text className={`text-base ${state.formData.type ? 'text-white' : 'text-gray-400'}`}>
                {getTypeDisplayText()}
              </Text>
              <Ionicons
                name={showTypeDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>

            {/* Dropdown Options */}
            {showTypeDropdown && (
              <View className="bg-gray-800 border border-gray-600 rounded-xl mt-2 overflow-hidden">
                <TouchableOpacity
                  onPress={() => handleTypeSelect('free')}
                  className="px-4 py-4 border-b border-gray-600"
                >
                  <Text className="text-white text-base">Free</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTypeSelect('paid')}
                  className="px-4 py-4"
                >
                  <Text className="text-white text-base">Paid</Text>
                </TouchableOpacity>
              </View>
            )}

            {state.errors.type && (
              <Text className="text-red-400 text-sm mt-2">{state.errors.type}</Text>
            )}
          </View>

          {/* Price Input - Only show for paid series */}
          {state.formData.type === 'paid' && (
            <View className="mb-8">
              <Text className="text-white text-base font-medium mb-4">Price</Text>
              <TextInput
                value={state.formData.price?.toString() || ''}
                onChangeText={(price) => updateFormData({ price: price ? parseInt(price) : undefined })}
                placeholder="₹30"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-800 border border-gray-600 text-white px-4 py-4 rounded-xl text-base"
                keyboardType="numeric"
              />
              {state.errors.price && (
                <Text className="text-red-400 text-sm mt-2">{state.errors.price}</Text>
              )}
            </View>
          )}

          {/* General Error */}
          {state.errors.general && (
            <View className="mb-6">
              <Text className="text-red-400 text-sm text-center">{state.errors.general}</Text>
            </View>
          )}
        </ScrollView>

        {/* Create Button */}
        <View className="px-4 pb-8 pt-4">
          <TouchableOpacity
            onPress={handleCreate}
            disabled={state.loading}
            className="bg-gray-200 rounded-full py-4 items-center"
            style={{
              backgroundColor: state.loading ? '#6B7280' : '#E5E7EB'
            }}
          >
            {state.loading ? (
              <ActivityIndicator size="small" color="black" />
            ) : (
              <Text className="text-black text-lg font-medium">Create</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SeriesCreationScreen;