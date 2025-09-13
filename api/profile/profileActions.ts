import { CONFIG } from '@/Constants/config';

export interface User {
  _id: string;
  username: string;
  profile_photo: string;
  total_followers?: number;
  is_following?: boolean;
}

export interface Community {
  _id: string;
  name: string;
  profile_photo: string;
  followers?: any[];
  creators?: any[];
  founder?: {
    _id: string;
    username: string;
    profile_photo: string;
  };
}

export interface FollowersResponse {
  message: string;
  followers: User[];
  count: number;
}

export interface FollowingResponse {
  message: string;
  following: User[];
  count: number;
}

export interface CombinedCommunitiesResponse {
  message: string;
  communities: Community[] | { created: Community[]; joined: Community[] };
}

export interface CommunitiesResponse {
  message: string;
  data: Community[] | { created: Community[]; joined: Community[] };
}

export class ProfileAPI {
  private static getHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get user followers
  static async getUserFollowers(
    token: string,
    userId?: string
  ): Promise<FollowersResponse> {
    const endpoint = userId 
      ? `/user/followers/${userId}`
      : '/user/followers';
      
    const response = await fetch(
      `${CONFIG.API_BASE_URL}${endpoint}`,
      {
        method: 'GET',
        headers: ProfileAPI.getHeaders(token),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get followers error response:', errorText);
      throw new Error(`Failed to get followers: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Get user following
  static async getUserFollowing(
    token: string,
    userId?: string
  ): Promise<FollowingResponse> {
    const endpoint = userId 
      ? `/user/following/${userId}`
      : '/user/following';
      
    const response = await fetch(
      `${CONFIG.API_BASE_URL}${endpoint}`,
      {
        method: 'GET',
        headers: ProfileAPI.getHeaders(token),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get following error response:', errorText);
      throw new Error(`Failed to get following: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Get user communities
  static async getUserCombinedCommunities(
    token: string,
    type: 'all' | 'created' | 'joined' = 'all'
  ): Promise<CombinedCommunitiesResponse> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/community/my-communities?type=${type}`,
      {
        method: 'GET',
        headers: ProfileAPI.getHeaders(token),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get communities error response:', errorText);
      throw new Error(`Failed to get communities: ${response.status} - ${errorText}`);
    }
    console.log("Fetched Combined communities");

    return response.json();
  }
  
  // Get user communities
  static async getUserCommunities(
    token: string,
  ): Promise<CommunitiesResponse> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/user/following-communities`,
      {
        method: 'GET',
        headers: ProfileAPI.getHeaders(token),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get communities error response:', errorText);
      throw new Error(`Failed to get communities: ${response.status} - ${errorText}`);
    }
    console.log("Fetched communities");

    return response.json();
  }

  // Search followers or following
  static async searchFollowersOrFollowing(
    token: string,
    query: string,
    type: 'followers' | 'following'
  ): Promise<{ users: User[] }> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/search/search-relations?query=${encodeURIComponent(query)}&type=${type}`,
      {
        method: 'GET',
        headers: ProfileAPI.getHeaders(token),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Search relations error response:', errorText);
      throw new Error(`Failed to search ${type}: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}

// Convenience functions for easier usage
export const profileActions = {
  getUserFollowers: ProfileAPI.getUserFollowers,
  getUserFollowing: ProfileAPI.getUserFollowing,
  getUserCombinedCommunities: ProfileAPI.getUserCombinedCommunities,
  getUserCommunities: ProfileAPI.getUserCommunities,
  searchFollowersOrFollowing: ProfileAPI.searchFollowersOrFollowing,
};