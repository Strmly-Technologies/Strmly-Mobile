import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Series } from '../types';

interface SimpleSeriesCreationScreenProps {
  onBack: () => void;
  onSeriesCreated: (series: Series) => void;
}

/**
 * Simple Series Creation Screen
 * Simplified version without useSeriesManagement hook to test duplicate screen issue
 */
const SimpleSeriesCreationScreen: React.FC<SimpleSeriesCreationScreenProps> = ({
  onBack,
  onSeriesCreated
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'free' | 'paid' | null>(null);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
    onBack();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Series title is required';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Series title must be 100 characters or less';
    }

    if (!type) {
      newErrors.type = 'Series type is required';
    }

    if (type === 'paid') {
      if (!price || price <= 0) {
        newErrors.price = 'Price must be greater than 0 for paid series';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newSeries: Series = {
        id: Date.now().toString(),
        title: title.trim(),
        description: '',
        totalEpisodes: 0,
        accessType: type!,
        price: type === 'paid' ? price : undefined,
        launchDate: new Date().toISOString(),
        totalViews: 0,
        totalEarnings: 0,
        episodes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setLoading(false);
      onSeriesCreated(newSeries);
    }, 1000);
  };

  const handleTypeSelect = (selectedType: 'free' | 'paid') => {
    setType(selectedType);
    setPrice(selectedType === 'free' ? undefined : price);
    setShowTypeDropdown(false);
  };

  const getTypeDisplayText = () => {
    if (!type) return 'Select';
    return type === 'free' ? 'Free' : 'Paid';
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

        <View className="flex-1 justify-center px-4">
          {/* Centered Content */}
          <View className="items-center">
            {/* Title */}
            <Text className="text-white text-xl font-medium mb-8">Give your series name</Text>

            {/* Series Name Input */}
            <View className="items-center mb-8">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Series 1"
                placeholderTextColor="#9CA3AF"
                className="text-white text-3xl font-medium text-center pb-2 mb-2"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#6B7280',
                  width: Math.max(120, (title || 'Series 1').length * 20), // Dynamic width based on text length
                  minWidth: 120
                }}
                maxLength={100}
                autoFocus
              />
              {errors.title && (
                <Text className="text-red-400 text-sm text-center mt-2">{errors.title}</Text>
              )}
            </View>

            {/* Type Selection */}
            <View className="w-full max-w-sm mb-6">
              <Text className="text-white text-base font-medium mb-4">Type</Text>

              {/* Type Dropdown */}
              <TouchableOpacity
                onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                className="bg-black border border-gray-600 rounded-xl px-6 py-4 flex-row items-center justify-between"
                style={{ minHeight: 56 }}
              >
                <Text className={`text-lg ${type ? 'text-white' : 'text-gray-400'}`}>
                  {getTypeDisplayText()}
                </Text>
                <Ionicons
                  name={showTypeDropdown ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>

              {/* Dropdown Options */}
              {showTypeDropdown && (
                <View
                  className="absolute top-20 left-0 right-0 border border-gray-500 z-10 max-h-64"
                  style={{
                    backgroundColor: '#2b2b2b',
                    borderRadius: 16
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleTypeSelect('free')}
                    className="px-6 py-4 border-b border-gray-500"
                    style={{
                      minHeight: 56,
                      backgroundColor: type === 'free' ? '#404040' : '#2b2b2b',
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                    }}
                  >
                    <Text className="text-white text-lg">Free</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleTypeSelect('paid')}
                    className="px-6 py-4"
                    style={{
                      minHeight: 56,
                      backgroundColor: type === 'paid' ? '#404040' : '#2b2b2b',
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    }}
                  >
                    <Text className="text-white text-lg">Paid</Text>
                  </TouchableOpacity>
                </View>
              )}

              {errors.type && (
                <Text className="text-red-400 text-sm mt-2">{errors.type}</Text>
              )}
            </View>

            {/* Price Input - Only show for paid series */}
            {type === 'paid' && (
              <View className="w-full max-w-sm mb-6">
                <Text className="text-white text-base font-medium mb-4">Price</Text>
                <TextInput
                  value={price?.toString() || ''}
                  onChangeText={(priceText) => setPrice(priceText ? parseInt(priceText) : undefined)}
                  placeholder="₹30"
                  placeholderTextColor="#9CA3AF"
                  className="bg-black border border-gray-600 text-white px-6 py-4 rounded-xl text-lg"
                  keyboardType="numeric"
                  style={{ minHeight: 56 }}
                />
                {errors.price && (
                  <Text className="text-red-400 text-sm mt-2">{errors.price}</Text>
                )}
              </View>
            )}

            {/* Create Button - Smaller width as shown in image */}
            <View className="items-center mt-4">
              <TouchableOpacity
                onPress={handleCreate}
                disabled={loading}
                className="bg-gray-200 rounded-full py-4 px-12 items-center"
                style={{
                  backgroundColor: loading ? '#6B7280' : '#E5E7EB',
                  width: 160 // Smaller width to match the image
                }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="black" />
                ) : (
                  <Text className="text-black text-lg font-medium">Create</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* General Error */}
            {errors.general && (
              <View className="w-full mt-4">
                <Text className="text-red-400 text-sm text-center">{errors.general}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SimpleSeriesCreationScreen;