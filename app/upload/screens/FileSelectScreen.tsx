import { StyleSheet, Text, View, Image, TouchableOpacity, StatusBar, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

interface FileSelectScreenProps {
  onFileSelected: (file: any) => void;
  onBack: () => void;
}

const FileSelectScreen: React.FC<FileSelectScreenProps> = ({
  onFileSelected,
  onBack
}) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Handle file selection
  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        // Basic file validation
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size && file.size > maxSize) {
          Alert.alert('File Too Large', 'Please select a video file smaller than 500MB');
          return;
        }

        console.log('Selected file:', file);
        setSelectedFile(file);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select file. Please try again.');
      console.error('File selection error:', error);
    }
  };

  // Handle continue with selected file
  const handleContinue = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
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
        <View style={styles.innerContainer}>
          <Image
            source={require('../../../assets/upload.png')}
            style={styles.uploadIcon}
            resizeMode="contain"
          />
          <Text style={styles.uploadText}>
            You can upload videos of any length — 30 sec, 5 min, 1 hours or more.
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleFileSelect}
          >
            <Text style={styles.uploadButtonText}>Upload file</Text>
          </TouchableOpacity>
          <Text style={styles.infoText}>
            Our smart AI detector reshapes your video to look great in both portrait and landscape views—so every viewer gets the best experience.
          </Text>
        </View>
      </View>

      {/* Continue Button - Only show when file is selected */}
      {selectedFile && (
        <View style={styles.continueButtonContainer}>
          <TouchableOpacity
            onPress={handleContinue}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
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
  },
  innerContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    height: 420,
    width: 361,
  },
  uploadIcon: {
    width: 320,
    height: 151,
    alignSelf: 'center',
    marginBottom: 16,
  },
  uploadText: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  uploadButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  uploadButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '500',
  },
  infoText: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  continueButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  continueButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  continueButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default FileSelectScreen;

