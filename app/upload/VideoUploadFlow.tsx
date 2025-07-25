import React from 'react';
import { useUploadFlow } from './hooks/useUploadFlow';
import FileSelectScreen from './screens/FileSelectScreen';
import FormatSelectScreen from './screens/FormatSelectScreen';
import VideoDetailScreen from './screens/VideoDetailScreen';
import FinalStageScreen from './screens/FinalStageScreen';
import UploadProgressScreen from './screens/UploadProgressScreen';

interface VideoUploadFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * Main Video Upload Flow Component
 * Orchestrates the entire upload process through multiple screens
 * 
 * Backend Integration Notes:
 * - This component manages the flow state and coordinates API calls
 * - Replace mock implementations with real API integrations
 * - Add proper error boundaries and loading states
 * - Consider implementing offline support for draft saving
 * 
 * Usage:
 * <VideoUploadFlow 
 *   onComplete={() => navigateToStudio()} 
 *   onCancel={() => navigateBack()} 
 * />
 */
const VideoUploadFlow: React.FC<VideoUploadFlowProps> = ({
  onComplete,
  onCancel
}) => {
  const {
    state,
    startUpload,
    goToNextStep,
    goToPreviousStep,
    updateVideoDetails,
    updateFinalStageData,
    setSelectedFile,
    setVideoFormat,
    validateCurrentStep,
    submitUpload,
    resetFlow,
  } = useUploadFlow();

  // Handle upload completion from progress screen
  const handleUploadComplete = () => {
    resetFlow();
    onComplete();
  };

  // Handle back navigation
  const handleBack = () => {
    if (state.currentStep === 'file-select') {
      // If user goes back from first screen, cancel the flow
      onCancel();
    } else {
      goToPreviousStep();
    }
  };

  // Handle file selection
  const handleFileSelected = (file: any) => {
    setSelectedFile(file);
    goToNextStep();
  };

  // Handle format selection
  const handleFormatSelected = (format: 'episode' | 'single') => {
    setVideoFormat(format);
    goToNextStep();
  };

  // Handle continue from video details
  const handleContinue = () => {
    if (validateCurrentStep()) {
      goToNextStep();
    }
  };

  // Handle final upload submission
  const handleFinalUpload = async () => {
    await submitUpload();
    // Don't reset flow or complete here - let the upload progress screen handle completion
  };

  // No need for auto-start effect since submitUpload handles it directly

  // Render current screen based on flow state
  const renderCurrentScreen = () => {
    switch (state.currentStep) {
      case 'file-select':
        return (
          <FileSelectScreen
            onFileSelected={handleFileSelected}
            onBack={handleBack}
          />
        );

      case 'format-select':
        return (
          <FormatSelectScreen
            onFormatSelected={handleFormatSelected}
            onBack={handleBack}
          />
        );

      case 'details-1':
        return (
          <VideoDetailScreen
            step={1}
            formData={state.videoDetails}
            onFormChange={updateVideoDetails}
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );

      case 'details-2':
        return (
          <VideoDetailScreen
            step={2}
            formData={state.videoDetails}
            onFormChange={updateVideoDetails}
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );

      case 'details-3':
        return (
          <VideoDetailScreen
            step={3}
            formData={state.videoDetails}
            onFormChange={updateVideoDetails}
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );

      case 'final':
        return (
          <FinalStageScreen
            formData={state.finalStageData}
            videoDetails={state.videoDetails}
            onFormChange={updateFinalStageData}
            onUpload={handleFinalUpload}
            onBack={handleBack}
          />
        );

      case 'progress':
        return (
          <UploadProgressScreen
            progress={state.uploadProgress}
            onUploadComplete={handleUploadComplete}
          />
        );

      default:
        return null;
    }
  };

  return renderCurrentScreen();
};

export default VideoUploadFlow;