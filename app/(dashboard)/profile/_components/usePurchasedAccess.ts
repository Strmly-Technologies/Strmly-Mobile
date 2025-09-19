import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { CONFIG } from '@/Constants/config';

interface AssetData {
  _id: string;
  title?: string;
  name?: string;
  description: string;
  posterUrl?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  total_episodes?: number;
  episodes?: Array<{
    _id: string;
    name: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    created_by: string;
  }>;
  created_by?: {
    _id: string;
    username: string;
    profile_photo: string;
  };
}

interface Asset {
  _id: string;
  user_id: string;
  content_id: string;
  videoUrl: string;
  thumbnailUrl: string;
  created_by: {
    _id: string;
    username: string;
    profile_photo: string;
  };
  content_type: 'video' | 'series';
  access_type: string;
  payment_method: string;
  payment_amount: number;
  expires_at: string | null;
  granted_at: string;
  createdAt: string;
  updatedAt: string;
  asset_data: AssetData;
}

interface CreatorPass {
  _id: string;
  user_id: string;
  creator_id: {
    _id: string;
    username: string;
    profile_photo: string;
  };
  amount_paid: number;
  end_date: string;
  status: string;
  start_date: string;
  createdAt: string;
}

interface PurchasedAccessData {
  assets: Asset[];
  creator_passes: CreatorPass[];
}

export const usePurchasedAccess = () => {
  const [data, setData] = useState<PurchasedAccessData>({ assets: [], creator_passes: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const fetchPurchasedAccess = async () => {
    if (!token) {
      setError('Authentication token missing');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/user/purchased-access`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch purchased access: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data || { assets: [], creator_passes: [] });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch purchased access');
      setData({ assets: [], creator_passes: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const removeAsset = async (id: string, type: 'asset' | 'creator_pass') => {
    if (!token) {
      throw new Error('Authentication token missing');
    }

    const endpoint = type === 'asset'
      ? `${CONFIG.API_BASE_URL}/user/purchased-access/asset/${id}`
      : `${CONFIG.API_BASE_URL}/user/purchased-access/creator-pass/${id}`;

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Failed to remove access');
    }

    // Update local state
    if (type === 'asset') {
      setData(prev => ({
        ...prev,
        assets: prev.assets.filter(asset => asset._id !== id)
      }));
    } else {
      setData(prev => ({
        ...prev,
        creator_passes: prev.creator_passes.filter(pass => pass._id !== id)
      }));
    }
  };

  useEffect(() => {
    fetchPurchasedAccess();
  }, [token]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchPurchasedAccess,
    removeAsset
  };
};

export type { Asset, CreatorPass, PurchasedAccessData };