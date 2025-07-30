import React, { useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface FormatSelectScreenProps {
  onFormatSelected: (format: 'episode' | 'single') => void;
  onBack: () => void;
}

/**
 * Video Format Selection Screen
 * Allows users to choose between Episode and Single video formats
 * 
 * Backend Integration Notes:
 * - Format selection affects how video is processed and displayed
 * - Episode format may require series association
 * - Single format is for standalone content
 * - This choice affects the subsequent form fields and validation
 */
const FormatSelectScreen: React.FC<FormatSelectScreenProps> = ({
  onFormatSelected,
  onBack
}) => {
  // Handle format selection and navigate directly
  const handleFormatSelect = (format: 'episode' | 'single') => {
    onFormatSelected(format);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>
          Select Video Format
        </Text>

        {/* Format Options */}
        <View style={styles.optionsContainer}>
          {/* Episode Option */}
          <TouchableOpacity
            onPress={() => handleFormatSelect('episode')}
            style={styles.optionButton}
          >
            <LinearGradient
              colors={['#000000', '#0a0a0a', '#1a1a1a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCard}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={require('../../../assets/episode.png')}
                  style={styles.formatIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.optionText}>Episode</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Single Option */}
          <TouchableOpacity
            onPress={() => handleFormatSelect('single')}
            style={styles.optionButton}
          >
            <LinearGradient
              colors={['#000000', '#0a0a0a', '#1a1a1a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCard}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={require('../../../assets/single.png')}
                  style={styles.formatIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.optionText}>Single</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <Text style={styles.description}>
          Select "Episode" for series or "Single" for one-time content.
        </Text>
      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 48,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 48,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  optionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },

  gradientCard: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatIcon: {
    width: 48,
    height: 48,
  },
  optionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 32,
  },

});

export default FormatSelectScreen;