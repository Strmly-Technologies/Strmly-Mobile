// Types for the video upload flow
// These interfaces define the data structures used throughout the upload process

export interface VideoFormData {
  title: string;
  community: string | null;
  format: 'Netflix' | 'Youtube' | null;
  videoType: 'free' | 'paid' | null;
}

export interface FinalStageData {
  genre: string | null;
  autoplayStartMinutes: number;
  autoplayStartSeconds: number;
  unlockFromMinutes: number;
  unlockFromSeconds: number;
}

export interface UploadFlowState {
  currentStep: 'file-select' | 'format-select' | 'episode-selection' | 'series-selection' | 'series-creation' | 'details-1' | 'details-2' | 'details-3' | 'final' | 'progress';
  uploadProgress: number;
  videoDetails: VideoFormData;
  finalStageData: FinalStageData;
  selectedFile: any; // Video file object
  videoFormat: 'episode' | 'single' | null;
  selectedSeries: any | null; // Series object for episodes
  isUploading: boolean;
  errors: Record<string, string>;
}

export interface DropdownOption {
  label: string;
  value: string;
  isSelected?: boolean;
}

// Props interfaces for components
export interface UploadProgressProps {
  progress: number; // 0-100
  onUploadComplete: () => void;
}

export interface VideoDetailProps {
  step: 1 | 2 | 3;
  formData: VideoFormData;
  onFormChange: (data: VideoFormData) => void;
  onContinue: () => void;
  onBack: () => void;
  selectedSeries?: any | null;
  videoFormat?: 'episode' | 'single' | null;
}

export interface FinalStageProps {
  formData: FinalStageData;
  videoDetails: VideoFormData;
  onFormChange: (data: FinalStageData) => void;
  onUpload: () => void;
  onBack: () => void;
  selectedSeries?: any | null;
  videoFormat?: 'episode' | 'single' | null;
}

export interface DropdownProps {
  value: string | null;
  placeholder: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface TimePickerProps {
  minutes: number;
  seconds: number;
  onMinutesChange: (minutes: number) => void;
  onSecondsChange: (seconds: number) => void;
}