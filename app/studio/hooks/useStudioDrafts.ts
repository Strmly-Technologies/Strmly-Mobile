import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { CONFIG } from '@/Constants/config';

interface DraftData {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  // Add other draft properties as needed
}

interface DraftsResponse {
  message: string;
  drafts: DraftData[];
  pagination: {
    page: number;
    limit: number;
    totalDrafts: number;
    totalPages: number;
    hasMore: boolean;
  };
  stats: {
    totalDrafts: number;
    expiredRemoved: number;
  };
}

interface TransformedDraft {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  date: string;
}

export const useStudioDrafts = () => {
  const [drafts, setDrafts] = useState<TransformedDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const fetchDrafts = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/drafts/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch drafts: ${response.status}`);
      }

      const data: DraftsResponse = await response.json();
      
      // Transform drafts data for UI
      const transformedDrafts: TransformedDraft[] = data.drafts.map((draft) => ({
        id: draft._id,
        title: draft.title,
        description: draft.description,
        thumbnail: draft.thumbnail || '',
        date: `Draft on ${new Date(draft.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
        })}, ${new Date(draft.createdAt).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}`,
      }));

      setDrafts(transformedDrafts);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [token]);

  const refetch = () => {
    fetchDrafts();
  };

  return {
    drafts,
    loading,
    error,
    refetch,
  };
};