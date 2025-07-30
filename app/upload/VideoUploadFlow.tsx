import React from 'react';
import { useUploadFlow } from './hooks/useUploadFlow';
import FileSelectScreen from './screens/FileSelectScreen';
import FormatSelectScreen from './screens/FormatSelectScreen';
import VideoDetailScreen from './screens/VideoDetailScreen';
import FinalStageScreen from './screens/FinalStageScreen';
import UploadProgressScreen from './screens/UploadProgressScreen';
import EpisodeSelectionScreen from './screens/EpisodeSelectionScreen';
import { SeriesSelectionScreen } from '../studio/screens';
import SimpleSeriesCreationScreen from '../studio/screens/SimpleSeriesCreationScreen';
import { Series } from '../studio/types';

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
    goToNextStep,
    goToPreviousStep,
    goToDetailsStep,
    updateVideoDetails,
    updateFinalStageData,
    setSelectedFile,
    setVideoFormat,
    setSelectedSeries,
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
    if (format === 'episode') {
      // Go to series selection for episodes
      goToNextStep(); // This will go to 'series-selection'
    } else {
      // Skip series selection for single videos and go directly to details
      goToNextStep(); // This will go to 'details-1'
    }
  };

  // Handle continue from video details
  const handleContinue = () => {
    if (validateCurrentStep()) {
      goToNextStep();
    }
  };

  // Handle series selection
  const handleSeriesSelected = (series: Series) => {
    setSelectedSeries(series);
    // Skip series creation and go directly to details
    goToDetailsStep();
  };

  // Handle add new series from series selection
  const handleAddNewSeries = () => {
    goToNextStep(); // Go to series-creation
  };

  // Handle series creation completion
  const handleSeriesCreated = (series: Series) => {
    setSelectedSeries(series);
    // After creating series, go to details
    goToDetailsStep();
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

      case 'episode-selection':
        return (
          <EpisodeSelectionScreen
            onBack={handleBack}
            onSeriesSelected={handleSeriesSelected}
            onAddNewSeries={handleAddNewSeries}
          />
        );

      case 'series-selection':
        return (
          <SeriesSelectionScreen
            onBack={handleBack}
            onSeriesSelected={handleSeriesSelected}
            onAddNewSeries={handleAddNewSeries}
          />
        );

      case 'series-creation':
        return (
          <SimpleSeriesCreationScreen
            onBack={handleBack}
            onSeriesCreated={handleSeriesCreated}
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
            selectedSeries={state.selectedSeries}
            videoFormat={state.videoFormat}
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
            selectedSeries={state.selectedSeries}
            videoFormat={state.videoFormat}
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
            selectedSeries={state.selectedSeries}
            videoFormat={state.videoFormat}
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
            selectedSeries={state.selectedSeries}
            videoFormat={state.videoFormat}
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