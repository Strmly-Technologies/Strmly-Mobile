import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  Modal,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useVideoPlayer, VideoView } from "expo-video";

interface FileSelectScreenProps {
  onFileSelected: (file: any) => void;
  onBack: () => void;
  onSaveToDraft?: () => void;
  onContinueUpload?: () => void;
  isEditingDraft?: boolean;
}

const FileSelectScreen: React.FC<FileSelectScreenProps> = ({
  onFileSelected,
  onBack,
  onSaveToDraft,
  onContinueUpload,
  isEditingDraft,
}) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Create video player instance - always call the hook to maintain hook order
  const player = useVideoPlayer(selectedFile?.uri || "", (player) => {
    if (selectedFile) {
      player.loop = false;
      player.volume = 1;
    }
  });

  const [showModal, setShowModal] = useState(false);

  const showContentOwnershipPopup = () => {
    setShowModal(true);
  };

  const handleViewPolicy = () => {
    Linking.openURL("https://www.strmly.com/legal/privacy");
    // Do NOT close modal here
  };

  const handleAccept = () => {
    setShowModal(false);
    handleFileSelect();
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  // Handle file selection
  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        // Basic file validation
        // const maxSize = 500 * 1024 * 1024; // 500MB
        // if (file.size && file.size > maxSize) {
        //   Alert.alert('File Too Large', 'Please select a video file smaller than 500MB');
        //   return;
        // }

        console.log("✅ FileSelectScreen: Selected file:", {
          name: file.name,
          size: file.size,
          type: file.mimeType,
          uri: file.uri,
        });

        if (file.size && file.size > 4 * 1024 * 1024 * 1024) {
          Alert.alert(
            "File Too Large",
            "Please select a video file smaller than 4GB"
          );
          return;
        }

        setSelectedFile(file);
        // Immediately notify parent component about file selection
        onFileSelected(file);
        console.log(
          "✅ FileSelectScreen: Notified parent about file selection"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select file. Please try again.");
      console.error("File selection error:", error);
    }
  };

  // Handle continue with selected file
  const handleContinue = () => {
    if (selectedFile) {
      console.log(
        "✅ FileSelectScreen: Continue with file:",
        selectedFile.name
      );
      if (onContinueUpload) {
        onContinueUpload();
      }
    } else {
      console.warn("⚠️ FileSelectScreen: No file selected");
      Alert.alert("No File Selected", "Please select a video file first.");
    }
  };

  // Handle video play/pause
  const togglePlayPause = () => {
    if (player && selectedFile) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle video selection from preview
  const handleSelectDifferentVideo = () => {
    setSelectedFile(null);
    setIsPlaying(false);
    handleAccept();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Show content ownership confirmation before file selection */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              ⚠️ Important:
              {"\n\n"}1. You are only allowed to upload your own original
              content.
              {"\n"}2. Uploading third-party or copyrighted content without
              permission is strictly prohibited.
              {"\n"}3. Uploading or sharing any content involving child
              exploitation, abuse, or sexual material (CSAM) is illegal and
              strictly forbidden.
              {"\n\n"}By continuing, you agree to follow these rules.
            </Text>

            <Pressable onPress={handleViewPolicy}>
              <Text style={styles.link}>📜 View Privacy Policy</Text>
            </Pressable>

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.button}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAccept}>
                <Text style={styles.button}>I Understand</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Main Content */}
      <View style={styles.content}>
        {selectedFile ? (
          /* Video Preview Card */
          <View style={styles.videoPreviewContainer}>
            <View style={styles.videoContainer}>
              {player && selectedFile && (
                <VideoView
                  player={player}
                  style={styles.video}
                  contentFit="contain"
                  nativeControls={false}
                  allowsPictureInPicture={false}
                />
              )}

              {/* Play/Pause Overlay */}
              <TouchableOpacity
                style={styles.playPauseOverlay}
                onPress={togglePlayPause}
              >
                <View style={styles.playPauseButton}>
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={32}
                    color="white"
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Video Info */}
            <View style={styles.videoInfo}>
              <Text style={styles.videoName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
              <Text style={styles.videoSize}>
                {selectedFile.size
                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                  : "Unknown size"}
              </Text>
            </View>

            {/* Change Video Button */}
            <TouchableOpacity
              style={styles.changeVideoButton}
              onPress={handleSelectDifferentVideo}
            >
              <Ionicons name="refresh" size={20} color="#9CA3AF" />
              <Text style={styles.changeVideoText}>Select Different Video</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Upload Interface */
          <View style={styles.innerContainer}>
            <Image
              source={require("../../../assets/upload.png")}
              style={styles.uploadIcon}
              resizeMode="contain"
            />
            <Text style={styles.uploadText}>
              You can upload videos of any length — 30 sec, 5 min, 1 hours or
              more.
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={showContentOwnershipPopup}
            >
              <Text style={styles.uploadButtonText}>Upload file</Text>
            </TouchableOpacity>
            <Text style={styles.infoText}>
              Our smart AI detector reshapes your video to look great in both
              portrait and landscape views—so every viewer gets the best
              experience.
            </Text>
          </View>
        )}
      </View>
      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {/* Save to Draft Button - Always show */}
        {onSaveToDraft && (
          <TouchableOpacity onPress={onSaveToDraft} style={styles.draftButton}>
            <Text style={styles.draftButtonText}>Save to Draft</Text>
          </TouchableOpacity>
        )}

        {/* Continue Button - Always show, but disabled when no file */}
        <TouchableOpacity
          onPress={handleContinue}
          style={[
            styles.continueButton,
            !selectedFile && styles.continueButtonDisabled,
          ]}
          disabled={!selectedFile}
        >
          <Text
            style={[
              styles.continueButtonText,
              !selectedFile && styles.continueButtonTextDisabled,
            ]}
          >
            {selectedFile ? "Continue" : "Select a video to continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    lineHeight: 22,
  },
  link: {
    fontSize: 16,
    color: "#007AFF",
    textDecorationLine: "underline",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    fontSize: 16,
    color: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },

  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "ios" ? 10 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "500",
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  innerContainer: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    height: 420,
    width: 361,
  },
  uploadIcon: {
    width: 320,
    height: 151,
    alignSelf: "center",
    marginBottom: 16,
  },
  uploadText: {
    color: "#9CA3AF",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  uploadButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  uploadButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "500",
  },
  infoText: {
    color: "#9CA3AF",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    marginBottom: 25,
    gap: 12,
  },
  draftButton: {
    backgroundColor: "#374151",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
  },
  draftButtonText: {
    color: "#E5E7EB",
    fontSize: 18,
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
  },
  continueButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "500",
  },
  continueButtonDisabled: {
    backgroundColor: "#374151",
  },
  continueButtonTextDisabled: {
    color: "#9CA3AF",
  },
  // Video Preview Styles
  videoPreviewContainer: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    width: 361,
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  playPauseOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  playPauseButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  videoInfo: {
    width: "100%",
    marginTop: 16,
    alignItems: "center",
  },
  videoName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  videoSize: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
  },
  changeVideoButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#374151",
  },
  changeVideoText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginLeft: 8,
  },
});

export default FileSelectScreen;
