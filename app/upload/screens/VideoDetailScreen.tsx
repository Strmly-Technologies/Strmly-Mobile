import React, { useState } from "react";
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FormField from "../components/FormField";
import Dropdown from "../components/Dropdown";
import ContinueButton from "../components/ContinueButton";
import { VideoDetailProps } from "../types";
import { formatOptions, videoTypeOptions } from "../data/dropdownOptions";
import { useCommunities } from "../hooks/useCommunities";
import * as ImagePicker from "expo-image-picker";

/**
 * Video Detail Screen
 * Multi-step form for video metadata configuration
 *
 * Backend Integration Notes:
 * - Form data should be validated on both client and server
 * - Consider auto-saving drafts as user types
 * - Implement proper error handling for API failures
 * - Add loading states for dropdown data fetching
 *
 * API Endpoints:
 * - GET /api/communities (for community dropdown)
 * - GET /api/formats (for format dropdown)
 * - POST /api/videos/draft (for saving draft data)
 */
const VideoDetailScreen: React.FC<VideoDetailProps> = ({
  step,
  formData,
  onFormChange,
  onContinue,
  onBack,
  selectedSeries,

  videoFormat,
  isEditingDraft,
}) => {
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);
  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);
  const [videoTypeDropdownOpen, setVideoTypeDropdownOpen] = useState(false);

  // Fetch communities dynamically
  const {
    communities: communityOptions,
    loading: communitiesLoading,
    error: communitiesError,
  } = useCommunities();

  const [thumbnail, setThumbnail] = useState(formData.thumbnail || null);

  const pickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      onFormChange({ ...formData, thumbnail: result.assets[0] });
    }
  };

  // Handle title change
  const handleTitleChange = (title: string) => {
    onFormChange({ ...formData, title });
  };

  // Handle community selection
  const handleCommunitySelect = (community: string) => {
    onFormChange({ ...formData, community });
    setCommunityDropdownOpen(false);
  };

  // Handle format selection
  const handleFormatSelect = (format: string) => {
    onFormChange({ ...formData, format: format as "Netflix" | "YouTube" });
    setFormatDropdownOpen(false);
  };

  // Handle video type selection
  const handleVideoTypeSelect = (videoType: string) => {
    onFormChange({ ...formData, videoType: videoType as "free" | "paid" });
    setVideoTypeDropdownOpen(false);
  };

  // Auto-set video type and price from selected series
  React.useEffect(() => {
    if (selectedSeries && videoFormat === "episode") {
      // Inherit video type and price from series
      const seriesVideoType =
        selectedSeries.accessType === "paid" ? "paid" : "free";
      const seriesPrice =
        selectedSeries.accessType === "paid" ? selectedSeries.price : undefined;

      // Only update if different from current values
      if (
        formData.videoType !== seriesVideoType ||
        formData.amount !== seriesPrice
      ) {
        onFormChange({
          ...formData,
          videoType: seriesVideoType,
          amount: seriesPrice,
        });
      }
    }
  }, [
    selectedSeries,
    videoFormat,
    formData.videoType,
    formData.amount,
    onFormChange,
  ]);

  // Check if current step is valid
  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.title.trim() !== "" && formData.community !== null;
      case 2:
        return (
          formData.title.trim() !== "" &&
          formData.community !== null &&
          formData.format !== null
        );
      case 3:
        const basicValidation =
          formData.title.trim() !== "" &&
          formData.community !== null &&
          formData.format !== null &&
          formData.videoType !== null;

        // Require thumbnail
        // const hasThumbnail = !!formData.thumbnail;

        // For episodes with selected series, validation is simpler since pricing is inherited
        // if (videoFormat === "episode" && selectedSeries) {
        //   return basicValidation && hasThumbnail;
        // }
        if (videoFormat === "episode" && selectedSeries) {
          return basicValidation;
        }

        // Additional validation for paid videos (single videos only)
        if (formData.videoType === "paid") {
          const hasValidAmount = formData.amount && formData.amount > 0;
          console.log(
            "💰 Paid video validation - amount:",
            formData.amount,
            "isValid:",
            hasValidAmount
          );
          return basicValidation && hasValidAmount;
        }

        // return basicValidation && hasThumbnail;
        return basicValidation;
      default:
        return false;
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 mt-12">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-medium">
          {isEditingDraft ? "Edit Draft" : "Video detail"}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1 px-4 pt-6"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Series Information - Hidden since series is already selected in previous step */}

        {/* Title Field */}
        <FormField
          label={videoFormat === "episode" ? "Episode Title" : "Title"}
          value={formData.title}
          placeholder={videoFormat === "episode" ? "Episode 1" : "Title"}
          onChangeText={handleTitleChange}
        />

        {/* Community Dropdown */}
        <View className="mb-8">
          <Text className="text-white text-lg font-medium mb-3">Community</Text>
          {communitiesLoading ? (
            <View className="bg-gray-800 rounded-lg p-4 flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white ml-2">Loading communities...</Text>
            </View>
          ) : communitiesError ? (
            <View className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <Text className="text-red-400 text-sm">
                No community Available
              </Text>
            </View>
          ) : null}
          <Dropdown
            value={
              formData.community
                ? communityOptions.find(
                    (option) => option.value === formData.community
                  )?.label || formData.community
                : null
            }
            placeholder="Select"
            options={communityOptions}
            onSelect={handleCommunitySelect}
            isOpen={communityDropdownOpen}
            onToggle={() => setCommunityDropdownOpen(!communityDropdownOpen)}
            disabled={communitiesLoading}
          />
        </View>

        {/* Format Dropdown - Show from step 2 onwards */}
        {step >= 2 && (
          <View className="mb-8">
            <Text className="text-white text-lg font-medium mb-3">
              Format That Fits Your Content
            </Text>
            <Dropdown
              value={formData.format}
              placeholder="Select"
              options={formatOptions}
              onSelect={handleFormatSelect}
              isOpen={formatDropdownOpen}
              onToggle={() => setFormatDropdownOpen(!formatDropdownOpen)}
            />
          </View>
        )}

        {/* Video Type Dropdown - Show from step 3 onwards, but hide if episode with selected series */}
        {step >= 3 && (
          <>
            {!(videoFormat === "episode" && selectedSeries) && (
              <View className="mb-8">
                <Text className="text-white text-lg font-medium mb-3">
                  Video Type
                </Text>
                <Dropdown
                  value={formData.videoType}
                  placeholder="Select"
                  options={videoTypeOptions}
                  onSelect={handleVideoTypeSelect}
                  isOpen={videoTypeDropdownOpen}
                  onToggle={() =>
                    setVideoTypeDropdownOpen(!videoTypeDropdownOpen)
                  }
                />

                {/* Price Input - Show only when Paid is selected */}
                {formData.videoType === "paid" && (
                  <View className="mt-4">
                    <FormField
                      label="Price (₹)"
                      value={formData.amount?.toString() || ""}
                      placeholder="Enter price (e.g., 10)"
                      onChangeText={(text) => {
                        let amount: number | undefined;
                        if (text.trim() === "") {
                          amount = undefined;
                        } else {
                          const parsed = parseFloat(text);
                          amount = isNaN(parsed) ? undefined : parsed;
                        }
                        console.log(
                          "💰 Price input changed:",
                          text,
                          "-> amount:",
                          amount,
                          "isValid:",
                          amount && amount > 0
                        );
                        onFormChange({ ...formData, amount });
                      }}
                      keyboardType="numeric"
                      error={
                        formData.videoType === "paid" &&
                        (!formData.amount || formData.amount <= 0)
                          ? "Price must be greater than 0"
                          : undefined
                      }
                    />
                  </View>
                )}
              </View>
            )}

            {/* <View className="mb-8">
              <Text className="text-white text-lg font-medium mb-3">
                Thumbnail
              </Text>
              {formData.thumbnail ? (
                <TouchableOpacity onPress={pickThumbnail}>
                  <Image
                    source={{ uri: formData.thumbnail.uri }}
                    style={{ width: 120, height: 80, borderRadius: 8 }}
                  />
                  <Text className="text-gray-400 mt-2">Tap to change</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={pickThumbnail}
                  className="bg-gray-800 p-4 rounded-lg items-center"
                >
                  <Ionicons name="image-outline" size={32} color="white" />
                  <Text className="text-white mt-2">Select Thumbnail</Text>
                </TouchableOpacity>
              )}

              {!formData.thumbnail && (
                <Text className="text-red-400 mt-2 text-sm">
                  Thumbnail is required
                </Text>
              )}
            </View> */}
          </>
        )}

        {/* Add some bottom padding for better scrolling */}
        <View className="h-32" />
      </ScrollView>

      {/* Continue Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-black pt-4 px-4"
        style={{ paddingBottom: 16 }}
      >
        <ContinueButton
          title={
            videoFormat === "episode" && selectedSeries
              ? "Continue"
              : formData.videoType === "paid" &&
                  (!formData.amount || formData.amount <= 0)
                ? "Enter Price to Continue"
                : "Continue"
          }
          onPress={onContinue}
          disabled={!isStepValid()}
        />
      </View>
    </View>
  );
};

export default VideoDetailScreen;
