import { CONFIG } from '@/Constants/config';

export interface CreateCommunityRequest {
  name: string;
  bio?: string;
  type: 'free' | 'paid';
  amount?: number;
  fee_description?: string;
  imageFile?: any; // For image upload
}

export interface Community {
  _id: string;
  name: string;
  bio: string;
  founder: string;
  followers: string[];
  community_fee_type: 'free' | 'paid';
  community_fee_amount: number;
  community_fee_description: string;
  profile_photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunityResponse {
  message: string;
  community: Community;
}

export class CommunityAPI {
  private static getHeaders(token: string, isFormData: boolean = false) {
    const headers: any = {
      'Authorization': `Bearer ${token}`,
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  // Create a new community
  static async createCommunity(
    token: string,
    communityData: CreateCommunityRequest
  ): Promise<CreateCommunityResponse> {
    const formData = new FormData();

    formData.append('name', communityData.name);
    if (communityData.bio) {
      formData.append('bio', communityData.bio);
    }
    formData.append('type', communityData.type);

    if (communityData.type === 'paid') {
      if (communityData.amount) {
        formData.append('amount', communityData.amount.toString());
      }
      if (communityData.fee_description) {
        formData.append('fee_description', communityData.fee_description);
      }
    }

    if (communityData.imageFile) {
      formData.append('imageFile', communityData.imageFile);
    }

    console.log('📤 Sending FormData to backend:', {
      name: communityData.name,
      bio: communityData.bio,
      type: communityData.type,
      amount: communityData.amount,
      fee_description: communityData.fee_description,
      hasImage: !!communityData.imageFile
    });

    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/create`,
     
      {
        method: 'POST',
        headers: CommunityAPI.getHeaders(token, true),
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Create community error response:', errorText);
      throw new Error(`Failed to create community: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Follow a community
  static async followCommunity(
    token: string,
    communityId: string
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/follow`,
     
      {
        method: 'POST',
        headers: CommunityAPI.getHeaders(token),
        body: JSON.stringify({ communityId }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Follow community error response:', errorText);
      throw new Error(`Failed to follow community: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Get community details
  static async getCommunityDetails(
    token: string,
    communityId: string
  ): Promise<any> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/profile/${communityId}`,
  
      {
        method: 'GET',
        headers: CommunityAPI.getHeaders(token),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get community details error response:', errorText);
      throw new Error(`Failed to get community details: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Get community followers
  static async getCommunityFollowers(
    token: string,
    communityId: string
  ): Promise<{ followers: any[] }> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/followers/${communityId}`,

      {
        method: 'GET',
        headers: CommunityAPI.getHeaders(token),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get community followers error response:', errorText);
      throw new Error(`Failed to get community followers: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Get community creators
  static async getCommunityCreators(
    token: string,
    communityId: string
  ): Promise<{ creators: any[] }> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/creators/${communityId}`,
   
      {
        method: 'GET',
        headers: CommunityAPI.getHeaders(token),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get community creators error response:', errorText);
      throw new Error(`Failed to get community creators: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Get community videos
  static async getCommunityVideos(
    token: string,
    communityId: string,
    videoType: 'long' | 'series' = 'long'
  ): Promise<{ videos: any[] }> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/${communityId}/videos?videoType=${videoType}`,
      
      {
        method: 'GET',
        headers: CommunityAPI.getHeaders(token),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get community videos error response:', errorText);
      throw new Error(`Failed to get community videos: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Rename a community
  static async renameCommunity(
    token: string,
    communityId: string,
    newName: string
  ): Promise<{ message: string; community: Community }> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/rename`,
    
      {
        method: 'PUT',
        headers: CommunityAPI.getHeaders(token),
        body: JSON.stringify({ communityId, newName }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Rename community error response:', errorText);
      throw new Error(`Failed to rename community: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Update community bio
  static async updateCommunityBio(
    token: string,
    communityId: string,
    bio: string
  ): Promise<{ message: string; community: Community }> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/add-bio`,
     
      {
        method: 'PUT',
        headers: CommunityAPI.getHeaders(token),
        body: JSON.stringify({ communityId, bio }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Update community bio error response:', errorText);
      throw new Error(`Failed to update community bio: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Update community profile photo
  static async updateCommunityPhoto(
    token: string,
    communityId: string,
    imageFile: any
  ): Promise<{ message: string; community: Community }> {
    const formData = new FormData();
    formData.append('communityId', communityId);
    formData.append('imageFile', imageFile);

    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/change-profile-photo`,
     
      {
        method: 'PUT',
        headers: CommunityAPI.getHeaders(token, true),
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Update community photo error response:', errorText);
      throw new Error(`Failed to update community photo: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Update community settings (creator limit, fee, etc.)
  static async updateCommunitySettings(
    token: string,
    communityId: string,
    settings: {
      creator_limit?: number;
      community_fee_type?: 'free' | 'paid';
      community_fee_amount?: number;
      community_fee_description?: string;
    }
  ): Promise<{ message: string; community: Community }> {
    console.log('📤 Updating community settings:', { communityId, settings });

    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/update-settings`,
      {
        method: 'POST',
        headers: CommunityAPI.getHeaders(token),
        body: JSON.stringify({ communityId, ...settings }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Update community settings error response:', errorText);
      throw new Error(`Failed to update community settings: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Get community analytics
  static async getCommunityAnalytics(
    token: string,
    communityId: string
  ): Promise<{
    success: boolean;
    message: string;
    community?: {
      id: string;
      name: string;
      founder: any;
      createdAt: string;
    };
    analytics?: {
      followers: {
        total: number;
        growth: any;
      };
      creators: {
        total: number;
        limit: number;
        utilizationPercentage: number;
      };
      content: {
        totalVideos: number;
        totalSeries: number;
        totalContent: number;
      };
      engagement: {
        totalLikes: number;
        totalViews: number;
        totalShares: number;
        averageLikesPerVideo: number;
      };
      earnings: {
        communityFees: {
          totalEarned: number;
          totalCollected: number;
          totalTransactions: number;
        };
        contentSales: {
          totalEarnings: number;
          totalRevenue: number;
          totalSales: number;
        };
        totalEarnings: number;
        totalRevenue: number;
      };
      growth: any;
      topPerforming: {
        videos: any[];
        series: any[];
      };
    };
  }> {
    try {
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/community-analytics/${communityId}`,
        {
          method: 'GET',
          headers: CommunityAPI.getHeaders(token),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Get community analytics error response:', errorText);
        
        // Return a structured error response instead of throwing
        return {
          success: false,
          message: `Failed to get community analytics: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Network error getting community analytics:', error);
      return {
        success: false,
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Get user communities
  static async getUserCommunities(
    token: string,
    type: 'all' | 'created' | 'joined' = 'all'
  ): Promise<{ communities: Community[]; createdCount: number; joinedCount: number; totalCount: number }> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/my-communities?type=${type}`,
     
      {
        method: 'GET',
        headers: CommunityAPI.getHeaders(token),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get user communities error response:', errorText);
      throw new Error(`Failed to get user communities: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Get trending community videos
  static async getTrendingVideos(
    token: string,
    limit: number = 20
  ): Promise<{ videos: any[] }> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/trending-videos?limit=${limit}`,
     
      {
        method: 'GET',
        headers: CommunityAPI.getHeaders(token),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get trending videos error response:', errorText);
      throw new Error(`Failed to get trending videos: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Get all communities for upload selection


  // Get all communities for upload selection
  static async getAllCommunities(
    token: string
  ): Promise<{ communities: Community[]; count: number; message: string }> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/all`,
      {
        method: 'GET',
        headers: CommunityAPI.getHeaders(token),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get all communities error response:', errorText);
      throw new Error(`Failed to get all communities: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}

// Convenience functions for easier usage
export const communityActions = {
  createCommunity: CommunityAPI.createCommunity,
  getCommunityDetails: CommunityAPI.getCommunityDetails,
  getCommunityFollowers: CommunityAPI.getCommunityFollowers,
  getCommunityCreators: CommunityAPI.getCommunityCreators,
  getCommunityVideos: CommunityAPI.getCommunityVideos,
  followCommunity: CommunityAPI.followCommunity,
  renameCommunity: CommunityAPI.renameCommunity,
  updateCommunityBio: CommunityAPI.updateCommunityBio,
  updateCommunityPhoto: CommunityAPI.updateCommunityPhoto,
  updateCommunitySettings: CommunityAPI.updateCommunitySettings,
  getCommunityAnalytics: CommunityAPI.getCommunityAnalytics,
  getUserCommunities: CommunityAPI.getUserCommunities,
  getTrendingVideos: CommunityAPI.getTrendingVideos,
  getAllCommunities: CommunityAPI.getAllCommunities,
 
};