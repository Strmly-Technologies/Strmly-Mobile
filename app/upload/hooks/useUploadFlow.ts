import { useState, useCallback } from 'react';
import { UploadFlowState, VideoFormData, FinalStageData } from '../types';

/**
 * Upload Flow State Management Hook
 * Manages the entire upload flow state and navigation
 * 
 * Backend Integration Notes:
 * - Replace mock upload progress with real API calls
 * - Implement proper error handling and retry logic
 * - Add form data persistence to prevent data loss
 * - Consider using React Query or SWR for API state management
 * 
 * API Integration Points:
 * - Video upload: POST /api/videos/upload
 * - Save draft: POST /api/videos/draft
 * - Publish video: POST /api/videos/publish
 */

const initialVideoDetails: VideoFormData = {
  title: '',
  community: null,
  format: null,
  videoType: null,
};

const initialFinalStageData: FinalStageData = {
  genre: null,
  autoplayStartMinutes: 0,
  autoplayStartSeconds: 22,
  unlockFromMinutes: 0,
  unlockFromSeconds: 22,
};

export const useUploadFlow = () => {
  const [state, setState] = useState<UploadFlowState>({
    currentStep: 'file-select',
    uploadProgress: 0,
    videoDetails: initialVideoDetails,
    finalStageData: initialFinalStageData,
    selectedFile: null,
    videoFormat: null,
    isUploading: false,
    errors: {},
  });

  // Start the upload process (now happens after final stage)
  const startUpload = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'progress',
      uploadProgress: 0,
      isUploading: true,
      errors: {},
    }));

    // Mock upload progress - replace with real upload API
    simulateUpload();
  }, []);

  // Mock upload simulation - replace with real API call
  const simulateUpload = useCallback(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setState(prev => ({
          ...prev,
          uploadProgress: 100,
          isUploading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          uploadProgress: progress,
        }));
      }
    }, 200);
  }, []);

  // Navigate to next step
  const goToNextStep = useCallback(() => {
    setState(prev => {
      let nextStep = prev.currentStep;
      
      switch (prev.currentStep) {
        case 'file-select':
          nextStep = 'format-select';
          break;
        case 'format-select':
          nextStep = 'details-1';
          break;
        case 'details-1':
          nextStep = 'details-2';
          break;
        case 'details-2':
          nextStep = 'details-3';
          break;
        case 'details-3':
          nextStep = 'final';
          break;
        case 'final':
          nextStep = 'progress'; // Upload happens after final stage
          break;
        case 'progress':
          // Upload complete - handled by onUploadComplete
          break;
      }

      return { ...prev, currentStep: nextStep };
    });
  }, []);

  // Navigate to previous step
  const goToPreviousStep = useCallback(() => {
    setState(prev => {
      let prevStep = prev.currentStep;
      
      switch (prev.currentStep) {
        case 'format-select':
          prevStep = 'file-select';
          break;
        case 'details-1':
          prevStep = 'format-select';
          break;
        case 'details-2':
          prevStep = 'details-1';
          break;
        case 'details-3':
          prevStep = 'details-2';
          break;
        case 'final':
          prevStep = 'details-3';
          break;
      }

      return { ...prev, currentStep: prevStep };
    });
  }, []);

  // Update video details
  const updateVideoDetails = useCallback((details: Partial<VideoFormData>) => {
    setState(prev => ({
      ...prev,
      videoDetails: { ...prev.videoDetails, ...details },
    }));
  }, []);

  // Update final stage data
  const updateFinalStageData = useCallback((data: Partial<FinalStageData>) => {
    setState(prev => ({
      ...prev,
      finalStageData: { ...prev.finalStageData, ...data },
    }));
  }, []);

  // Set selected file
  const setSelectedFile = useCallback((file: any) => {
    setState(prev => ({
      ...prev,
      selectedFile: file,
    }));
  }, []);

  // Set video format
  const setVideoFormat = useCallback((format: 'episode' | 'single') => {
    setState(prev => ({
      ...prev,
      videoFormat: format,
    }));
  }, []);

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    const { currentStep, videoDetails, finalStageData, selectedFile, videoFormat } = state;
    
    switch (currentStep) {
      case 'file-select':
        return selectedFile !== null;
      case 'format-select':
        return videoFormat !== null;
      case 'details-1':
        return videoDetails.title.trim() !== '' && videoDetails.community !== null;
      case 'details-2':
        return videoDetails.title.trim() !== '' && 
               videoDetails.community !== null && 
               videoDetails.format !== null;
      case 'details-3':
        return videoDetails.title.trim() !== '' && 
               videoDetails.community !== null && 
               videoDetails.format !== null &&
               videoDetails.videoType !== null;
      case 'final':
        return finalStageData.genre !== null;
      default:
        return true;
    }
  }, [state]);

  // Submit final upload (now triggers progress screen)
  const submitUpload = useCallback(async () => {
    // Start upload directly (this will set currentStep to 'progress' and begin upload)
    startUpload();
    return true;
  }, [startUpload]);

  // Reset flow
  const resetFlow = useCallback(() => {
    setState({
      currentStep: 'file-select',
      uploadProgress: 0,
      videoDetails: initialVideoDetails,
      finalStageData: initialFinalStageData,
      selectedFile: null,
      videoFormat: null,
      isUploading: false,
      errors: {},
    });
  }, []);

  return {
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
  };
};