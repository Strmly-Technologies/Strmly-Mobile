import { useState, useEffect } from 'react';
import { CONFIG } from '../../../Constants/config';

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

  const fetchSeries = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/series/all/`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODg0Yzc0YWU3M2Q4ZDRlZjY3YjAyZTQiLCJpYXQiOjE3NTM1MzIyMzYsImV4cCI6MTc1NjEyNDIzNn0._pqT9psCN1nR5DJpB60HyA1L1pp327o1fxfZPO4BY3M',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch series: ${response.status}`);
      }

      const data: SeriesResponse = await response.json();
      
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

      setSeries(transformedSeries);
    } catch (err) {
      console.error('Error fetching series:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch series');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  const refetch = () => {
    fetchSeries();
  };

  return {
    series,
    loading,
    error,
    refetch,
  };
};