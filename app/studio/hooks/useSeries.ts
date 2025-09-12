import { useState, useEffect } from 'react';
import { CONFIG } from '../../../Constants/config';

import { useAuthStore } from '@/store/useAuthStore';

interface SeriesAnalytics {
  total_likes: number;
  total_views: number;
  total_shares: number;
  total_reshares: number;
  followers_gained_through_series: number;
  engagement_rate: number;
  last_analytics_update: string;
}

interface SeriesCreator {
  _id: string;
  username: string;
  email: string;
}

interface SeriesCommunity {
  _id: string;
  name: string;
}

interface SeriesData {
  _id: string;
  title: string;
  description: string;
  bannerUrl?: string;
  posterUrl?: string;
  genre: string;
  language: string;
  age_restriction: boolean;
  type: string;
  status: string;
  total_episodes: number;
  episodes: any[];
  release_date: string;
  seasons: number;
  likes: number;
  shares: number;
  views: number;
  earned_till_date: number;
  created_by: SeriesCreator;
  updated_by: string;
  community?: SeriesCommunity;
  analytics: SeriesAnalytics;
  followers: any[];
  total_earned: number;
  total_revenue: number;
  platform_commission: number;
  total_purchases: number;
  createdAt: string;
  updatedAt: string;
}

interface SeriesResponse {
  message: string;
  data: SeriesData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
  };
}

interface TransformedSeries {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  date: string;
  genre: string;
  status: string;
  episodes: number;
  views: number;
  likes: number;
  type: string;
}

export const useSeries = () => {
  const [series, setSeries] = useState<TransformedSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  

  const fetchSeries = async () => {
    try {
      setLoading(true);
      setError(null);

      const { token } = useAuthStore.getState();
      
      console.log('🔍 fetchSeries Debug Info:');
      console.log('  - API Base URL:', CONFIG.API_BASE_URL);
      console.log('  - Token exists:', !!token);
      console.log('  - Token length:', token?.length || 0);
      console.log('  - Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const url = `${CONFIG.API_BASE_URL}/series/user?t=${Date.now()}`;
      console.log('  - Full URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      console.log('📊 Response Debug Info:');
      console.log('  - Status:', response.status);
      console.log('  - Status Text:', response.statusText);
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Handle the specific case where user has no series (backend returns 404 instead of 200)
        if (response.status === 404) {
          try {
            const errorData = await response.json();
            console.log('❌ Error response data:', errorData);
            
            // If the error message indicates no series found, treat it as success with empty array
            if (errorData.error === "No series found for this user") {
              console.log('✅ No series found - treating as empty result');
              setSeries([]);
              return; // Exit early, don't throw error
            }
          } catch (parseError) {
            console.log('❌ Could not parse 404 error response as JSON');
          }
        }
        
        // For other errors, get detailed error information
        let errorMessage = `Failed to fetch series: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('❌ Error response data:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.log('❌ Could not parse error response as JSON');
          const errorText = await response.text();
          console.log('❌ Error response text:', errorText);
        }
        throw new Error(errorMessage);
      }

      const data: SeriesResponse = await response.json();
      
      console.log('✅ Raw API response:', data);
      
      // Handle case where data.data might be undefined or not an array
      if (!data.data || !Array.isArray(data.data)) {
        console.log('⚠️ Invalid data structure, treating as empty array');
        setSeries([]);
        return;
      }
      
      // Transform series data for UI
      const transformedSeries: TransformedSeries[] = data.data.map((seriesItem) => ({
        id: seriesItem._id,
        title: seriesItem.title,
        description: seriesItem.description,
        thumbnail: seriesItem.posterUrl || seriesItem.bannerUrl || '',
        date: new Date(seriesItem.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        genre: seriesItem.genre,
        status: seriesItem.status,
        episodes: seriesItem.total_episodes,
        views: seriesItem.views,
        likes: seriesItem.likes,
        type: seriesItem.type,
      }));

      console.log('📊 Transformed series data:', transformedSeries.length, 'series');
      console.log('📊 Series IDs:', transformedSeries.map(s => s.id));
      console.log('📊 Transformed series data:', transformedSeries.length, 'series');
      console.log('📊 Series IDs:', transformedSeries.map(s => s.id));
      setSeries(transformedSeries);
    } catch (err) {
      console.error('🚨 Error fetching series:', err);
      console.error('🚨 Error type:', typeof err);
      console.error('🚨 Error constructor:', err?.constructor?.name);
      
      if (err instanceof Error) {
        console.error('🚨 Error message:', err.message);
        console.error('🚨 Error stack:', err.stack);
      }
      
      setError(err instanceof Error ? err.message : 'Failed to fetch series');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  const refetch = async () => {
    console.log('🔄 Refetching series data...');
    // Clear current series to force a refresh
    setSeries([]);
    setError(null);
    setRefreshKey(prev => prev + 1);
    await fetchSeries();
  };

  return {
    series,
    loading,
    error,
    refetch,
    refreshKey,
    
  };
};