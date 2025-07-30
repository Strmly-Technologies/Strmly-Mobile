import { useState, useCallback } from 'react';
import { UploadFlowState, VideoFormData, FinalStageData } from '../types';
import { Series } from '../../studio/types';
import { CONFIG } from '../../../Constants/config';

/**
 * Upload Flow State Management Hook
 * Manages the entire upload flow state and navigation
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
    selectedSeries: null,
    isUploading: false,
    errors: {},
  });

  const [draftId, setDraftId] = useState<string | null>(null);

  // Create initial draft when upload starts
  const createInitialDraft = useCallback(async () => {
    if (draftId) {
      console.log('Draft already exists with ID:', draftId);
      return draftId;
    }

    try {
      const draftData = {
        name: 'Untitled Video',
        description: 'No description',
        genre: 'Action',
        type: 'Free',
        language: 'english'
      };

      console.log('Creating initial draft with data:', draftData);

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/drafts/create-or-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODg0Yzc0YWU3M2Q4ZDRlZjY3YjAyZTQiLCJpYXQiOjE3NTM1MzIyMzYsImV4cCI6MTc1NjEyNDIzNn0._pqT9psCN1nR5DJpB60HyA1L1pp327o1fxfZPO4BY3M'
        },
        body: JSON.stringify(draftData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Draft creation failed with status:', response.status);
        console.error('Error response:', errorText);
        return null;
      }

      const result = await response.json();
      console.log('Initial draft creation response:', result);

      if (response.ok && result.draft && result.draft.id) {
        setDraftId(result.draft.id);
        console.log('Initial draft created successfully with ID:', result.draft.id);
        return result.draft.id;
      } else {
        console.error('Failed to create initial draft:', result);
        return null;
      }
    } catch (error) {
      console.error('Error creating initial draft:', error);
      return null;
    }
  }, [draftId]);

  // Update existing draft with current form data
  const updateDraft = useCallback(async () => {
    if (!draftId) {
      console.log('No draft ID available, creating initial draft first');
      return await createInitialDraft();
    }

    try {
      const draftData = {
        id: draftId,
        name: state.videoDetails.title || 'Untitled Video',
        description: state.videoDetails.title || 'No description',
        genre: state.finalStageData.genre || 'Action',
        type: state.videoDetails.videoType === 'paid' ? 'Paid' : 'Free',
        language: 'english'
      };

      console.log('Updating draft with data:', draftData);

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/drafts/create-or-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODg0Yzc0YWU3M2Q4ZDRlZjY3YjAyZTQiLCJpYXQiOjE3NTM1MzIyMzYsImV4cCI6MTc1NjEyNDIzNn0._pqT9psCN1nR5DJpB60HyA1L1pp327o1fxfZPO4BY3M'
        },
        body: JSON.stringify(draftData)
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Draft update failed with status:', response.status);
        console.error('Error response:', errorText);
        return null;
      }

      const result = await response.json();
      console.log('Draft update response:', result);

      if (response.ok && result.draft && result.draft.id) {
        console.log('Draft updated successfully with ID:', result.draft.id);
        return result.draft.id;
      } else {
        console.error('Failed to update draft:', result);
        return null;
      }
    } catch (error) {
      console.error('Error updating draft:', error);
      return null;
    }
  }, [state, draftId, createInitialDraft]);

  // Start the upload process
  const startUpload = useCallback(() => {
    console.log('Starting upload process...');
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
          nextStep = prev.videoFormat === 'episode' ? 'episode-selection' : 'details-1';
          break;
        case 'episode-selection':
          nextStep = 'details-1';
          break;
        case 'series-selection':
          nextStep = 'series-creation';
          break;
        case 'series-creation':
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
          nextStep = 'progress';
          break;
        case 'progress':
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
        case 'episode-selection':
          prevStep = 'format-select';
          break;
        case 'series-selection':
          prevStep = 'episode-selection';
          break;
        case 'series-creation':
          prevStep = 'series-selection';
          break;
        case 'details-1':
          prevStep = prev.videoFormat === 'episode' ? 'episode-selection' : 'format-select';
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

    // Auto-save draft when video details are updated (with debounce)
    setTimeout(() => {
      updateDraft();
    }, 1000);
  }, [updateDraft]);

  // Update final stage data
  const updateFinalStageData = useCallback((data: Partial<FinalStageData>) => {
    setState(prev => ({
      ...prev,
      finalStageData: { ...prev.finalStageData, ...data },
    }));

    // Auto-save draft when final stage data is updated
    setTimeout(() => {
      updateDraft();
    }, 1000);
  }, [updateDraft]);

  // Set selected file
  const setSelectedFile = useCallback((file: any) => {
    setState(prev => ({
      ...prev,
      selectedFile: file,
    }));

    // Create initial draft when file is selected
    setTimeout(() => {
      createInitialDraft();
    }, 500);
  }, [createInitialDraft]);

  // Set video format
  const setVideoFormat = useCallback((format: 'episode' | 'single') => {
    setState(prev => ({
      ...prev,
      videoFormat: format,
    }));
  }, []);

  // Set selected series
  const setSelectedSeries = useCallback((series: Series) => {
    setState(prev => ({
      ...prev,
      selectedSeries: series,
    }));
  }, []);

  // Go directly to details step
  const goToDetailsStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'details-1',
    }));
  }, []);

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    const { currentStep, videoDetails, finalStageData, selectedFile, videoFormat, selectedSeries } = state;

    switch (currentStep) {
      case 'file-select':
        return selectedFile !== null;
      case 'format-select':
        return videoFormat !== null;
      case 'series-selection':
        return selectedSeries !== null;
      case 'series-creation':
        return true;
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

  // Submit final upload
  const submitUpload = useCallback(async () => {
    if (!state.selectedFile) {
      console.error('No selected file for upload');
      return false;
    }

    // Ensure we have a draft ID before uploading
    let currentDraftId = draftId;
    if (!currentDraftId) {
      console.log('No draft ID found, creating draft before upload...');
      currentDraftId = await createInitialDraft();
      if (!currentDraftId) {
        console.error('Failed to create draft before upload');
        return false;
      }
    }

    setState(prev => ({ ...prev, currentStep: 'progress', uploadProgress: 0, isUploading: true }));

    try {
      // Create FormData for video upload
      const formData = new FormData();
      formData.append('videoFile', {
        uri: state.selectedFile.uri,
        type: state.selectedFile.type || 'video/mp4',
        name: state.selectedFile.name || 'video.mp4',
      } as any);

      console.log('Completing draft upload with ID:', currentDraftId);
      console.log('Selected file details:', {
        name: state.selectedFile.name,
        size: state.selectedFile.size,
        type: state.selectedFile.type,
        uri: state.selectedFile.uri
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setState(prev => {
          const newProgress = Math.min(prev.uploadProgress + Math.random() * 10, 90);
          return { ...prev, uploadProgress: newProgress };
        });
      }, 500);

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/drafts/complete/${currentDraftId}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODg0Yzc0YWU3M2Q4ZDRlZjY3YjAyZTQiLCJpYXQiOjE3NTM1MzIyMzYsImV4cCI6MTc1NjEyNDIzNn0._pqT9psCN1nR5DJpB60HyA1L1pp327o1fxfZPO4BY3M',
        },
        body: formData,
      });

      clearInterval(progressInterval);

      const result = await response.json();
      console.log('Upload completion response:', result);

      if (response.ok) {
        setState(prev => ({ ...prev, uploadProgress: 100, isUploading: false }));
        return true;
      } else {
        console.error('Upload failed:', result);
        setState(prev => ({ ...prev, isUploading: false, errors: { upload: result.error || 'Upload failed' } }));
        return false;
      }
    } catch (error) {
      console.error('Upload error:', error);
      setState(prev => ({ ...prev, isUploading: false, errors: { upload: 'Network error during upload' } }));
      return false;
    }
  }, [draftId, state.selectedFile, createInitialDraft]);

  // Reset flow
  const resetFlow = useCallback(() => {
    setState({
      currentStep: 'file-select',
      uploadProgress: 0,
      videoDetails: initialVideoDetails,
      finalStageData: initialFinalStageData,
      selectedFile: null,
      videoFormat: null,
      selectedSeries: null,
      isUploading: false,
      errors: {},
    });
    setDraftId(null);
  }, []);

  return {
    state,
    startUpload,
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
    createInitialDraft,
    updateDraft,
    draftId,
  };
};