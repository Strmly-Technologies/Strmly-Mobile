import { useState, useCallback } from 'react';
import { 
  SeriesManagementState, 
  SeriesFormData, 
  Series, 
  CreateSeriesRequest,
  CreateSeriesResponse,
  GetSeriesListResponse,
  UpdateSeriesRequest,
  UpdateSeriesResponse
} from '../types';

/**
 * Series Management State Hook
 * Manages series list, selection, form data, and navigation state
 * 
 * Backend Integration Notes:
 * - Replace mock API calls with real backend endpoints
 * - Implement proper error handling and retry logic
 * - Add data persistence and caching
 * - Consider using React Query or SWR for API state management
 * 
 * API Integration Points:
 * - Get series list: GET /api/series
 * - Create series: POST /api/series
 * - Update series: PUT /api/series/:id
 * - Get series details: GET /api/series/:id
 */

const initialFormData: SeriesFormData = {
  title: '',
  type: null,
  price: undefined,
};

const initialState: SeriesManagementState = {
  series: [],
  selectedSeriesId: null,
  isCreating: false,
  formData: initialFormData,
  loading: false,
  errors: {},
};

export const useSeriesManagement = () => {
  const [state, setState] = useState<SeriesManagementState>(initialState);

  // Mock data for development - replace with API calls
  const mockSeries: Series[] = [
    {
      id: '1',
      title: 'Squid Game Season 1',
      description: 'A thrilling survival series',
      totalEpisodes: 6,
      accessType: 'paid',
      price: 29,
      launchDate: '2025-06-15T11:29:00Z',
      totalViews: 500000,
      totalEarnings: 43000,
      episodes: [
        {
          id: '1',
          seriesId: '1',
          title: 'Death',
          description: 'The first episode',
          thumbnail: 'https://via.placeholder.com/150x100/8B5CF6/FFFFFF?text=Death',
          videoUrl: '/videos/death.mp4',
          uploadDate: '2025-06-15T11:29:00Z',
          views: 500000,
          conversions: 2100,
          duration: 3600,
          status: 'ready'
        },
        {
          id: '2',
          seriesId: '1',
          title: 'Death',
          description: 'The second episode',
          thumbnail: 'https://via.placeholder.com/150x100/8B5CF6/FFFFFF?text=Death',
          videoUrl: '/videos/death2.mp4',
          uploadDate: '2025-06-15T11:29:00Z',
          views: 500000,
          conversions: 2100,
          duration: 3600,
          status: 'ready'
        },
        {
          id: '3',
          seriesId: '1',
          title: 'Death',
          description: 'The third episode',
          thumbnail: 'https://via.placeholder.com/150x100/8B5CF6/FFFFFF?text=Death',
          videoUrl: '/videos/death3.mp4',
          uploadDate: '2025-06-15T11:29:00Z',
          views: 500000,
          conversions: 2100,
          duration: 3600,
          status: 'ready'
        },
        {
          id: '4',
          seriesId: '1',
          title: 'Death',
          description: 'The fourth episode',
          thumbnail: 'https://via.placeholder.com/150x100/8B5CF6/FFFFFF?text=Death',
          videoUrl: '/videos/death4.mp4',
          uploadDate: '2025-06-15T11:29:00Z',
          views: 500000,
          conversions: 2100,
          duration: 3600,
          status: 'ready'
        },
        {
          id: '5',
          seriesId: '1',
          title: 'Death',
          description: 'The fifth episode',
          thumbnail: 'https://via.placeholder.com/150x100/8B5CF6/FFFFFF?text=Death',
          videoUrl: '/videos/death5.mp4',
          uploadDate: '2025-06-15T11:29:00Z',
          views: 500000,
          conversions: 2100,
          duration: 3600,
          status: 'ready'
        }
      ],
      createdAt: '2025-06-15T11:29:00Z',
      updatedAt: '2025-06-15T11:29:00Z'
    },
    {
      id: '2',
      title: 'Tech Tutorials',
      description: 'Free programming tutorials',
      totalEpisodes: 0,
      accessType: 'free',
      launchDate: '2025-05-01T10:00:00Z',
      totalViews: 0,
      totalEarnings: 0,
      episodes: [],
      createdAt: '2025-05-01T10:00:00Z',
      updatedAt: '2025-05-01T10:00:00Z'
    }
  ];

  // Load series list
  const loadSeries = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, errors: {} }));
    
    try {
      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response: GetSeriesListResponse = {
        success: true,
        series: mockSeries
      };

      if (response.success && response.series) {
        setState(prev => ({
          ...prev,
          series: response.series!,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          errors: { general: response.error || 'Failed to load series' }
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        errors: { general: 'Network error occurred' }
      }));
    }
  }, []);

  // Select a series
  const selectSeries = useCallback((seriesId: string) => {
    setState(prev => ({
      ...prev,
      selectedSeriesId: seriesId,
      errors: {}
    }));
  }, []);

  // Clear series selection
  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedSeriesId: null
    }));
  }, []);

  // Update form data
  const updateFormData = useCallback((data: Partial<SeriesFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data },
      errors: { ...prev.errors }
    }));
  }, []);

  // Validate form data
  const validateForm = useCallback((): boolean => {
    const { formData } = state;
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Series title is required';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Series title must be 100 characters or less';
    }

    if (!formData.type) {
      newErrors.type = 'Series type is required';
    }

    if (formData.type === 'paid') {
      if (!formData.price || formData.price <= 0) {
        newErrors.price = 'Price must be greater than 0 for paid series';
      }
    }

    setState(prev => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [state]);

  // Create a new series
  const createSeries = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setState(prev => ({ ...prev, loading: true, errors: {} }));

    try {
      const request: CreateSeriesRequest = {
        title: state.formData.title.trim(),
        type: state.formData.type!,
        price: state.formData.type === 'paid' ? state.formData.price : undefined
      };

      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSeries: Series = {
        id: Date.now().toString(),
        title: request.title,
        description: '',
        totalEpisodes: 0,
        accessType: request.type,
        price: request.price,
        launchDate: new Date().toISOString(),
        totalViews: 0,
        totalEarnings: 0,
        episodes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response: CreateSeriesResponse = {
        success: true,
        series: newSeries
      };

      if (response.success && response.series) {
        setState(prev => ({
          ...prev,
          series: [...prev.series, response.series!],
          formData: initialFormData,
          isCreating: false,
          loading: false
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          errors: { general: response.error || 'Failed to create series' }
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        errors: { general: 'Network error occurred' }
      }));
      return false;
    }
  }, [state.formData, validateForm]);

  // Update an existing series
  const updateSeries = useCallback(async (seriesId: string, updates: Partial<Series>): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, errors: {} }));

    try {
      const request: UpdateSeriesRequest = {
        id: seriesId,
        ...updates
      };

      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response: UpdateSeriesResponse = {
        success: true,
        series: {
          ...state.series.find(s => s.id === seriesId)!,
          ...updates,
          updatedAt: new Date().toISOString()
        }
      };

      if (response.success && response.series) {
        setState(prev => ({
          ...prev,
          series: prev.series.map(s => 
            s.id === seriesId ? response.series! : s
          ),
          loading: false
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          errors: { general: response.error || 'Failed to update series' }
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        errors: { general: 'Network error occurred' }
      }));
      return false;
    }
  }, [state.series]);

  // Start creating a new series
  const startCreating = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCreating: true,
      formData: initialFormData,
      errors: {}
    }));
  }, []);

  // Cancel series creation
  const cancelCreating = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCreating: false,
      formData: initialFormData,
      errors: {}
    }));
  }, []);

  // Navigate to series analytics (now just a placeholder)
  const navigateToAnalytics = useCallback(() => {
    // Navigation handled by parent component
    console.log('Navigate to analytics for series:', state.selectedSeriesId);
  }, [state.selectedSeriesId]);

  // Navigate back to selection (now just clears selection)
  const navigateToSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Get selected series
  const getSelectedSeries = useCallback((): Series | null => {
    if (!state.selectedSeriesId) return null;
    return state.series.find(s => s.id === state.selectedSeriesId) || null;
  }, [state.selectedSeriesId, state.series]);

  // Reset all state
  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  return {
    // State
    state,
    
    // Series management
    loadSeries,
    selectSeries,
    clearSelection,
    getSelectedSeries,
    
    // Form management
    updateFormData,
    validateForm,
    
    // CRUD operations
    createSeries,
    updateSeries,
    
    // Navigation
    startCreating,
    cancelCreating,
    navigateToAnalytics,
    navigateToSelection,
    
    // Utilities
    resetState,
    clearErrors,
  };
};