import { useState, useCallback } from 'react';
import { CONFIG } from '../../../Constants/config';
import { useAuthStore } from '../../../store/useAuthStore';

interface SearchResult {
  videos: any[];
  accounts: any[];
  communities: any[];
}

interface UseSearchReturn {
  searchResults: SearchResult;
  isLoading: boolean;
  error: string | null;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useSearch = (): UseSearchReturn => {
  const { token } = useAuthStore();
  const [searchResults, setSearchResults] = useState<SearchResult>({
    videos: [],
    accounts: [],
    communities: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      clearSearch();
      return;
    }

    if (!token) {
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/v1/search?query=${encodeURIComponent(query)}&limit=20`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      // Debug logging to see what we're getting
      console.log('Search API Response:', {
        totalResults: data.totalResults,
        videos: data.results?.videos?.length || 0,
        users: data.results?.users?.length || 0,
        series: data.results?.series?.length || 0
      });

      // Handle the actual API response structure based on your Postman response
      setSearchResults({
        videos: data.results?.videos || [],
        accounts: data.results?.users || [],
        communities: data.results?.series || []
      });

    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults({ videos: [], accounts: [], communities: [] });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const clearSearch = useCallback(() => {
    setSearchResults({ videos: [], accounts: [], communities: [] });
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    searchResults,
    isLoading,
    error,
    performSearch,
    clearSearch
  };
};