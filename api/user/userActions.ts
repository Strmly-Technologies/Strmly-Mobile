// User API Actions
import { CONFIG } from '@/Constants/config';

const API_BASE_URL = CONFIG.API_BASE_URL;

// Types based on actual API response
export interface UserProfile {
  message: string;
  user: {
    _id: string;
    username: string;
    email: string;
    profile_photo: string;
    bio: string;
    followers: any[];
    following: any[];
    my_communities: any[];
    community: any[];
    interests: any[];
    viewed_videos: any[];
    shared_videos: any[];
    commented_videos: any[];
    replied_comments: any[];
    liked_communities: any[];
    already_watched_long_videos: any[];
    onboarding_completed: boolean;
    drafts: any[];
    creator_profile: {
      bank_details: {
        account_type: string;
      };
      upi_id: string | null;
      upi_fund_account_id: string | null;
      withdrawal_enabled: boolean;
      bank_verified: boolean;
      total_earned: number;
      verification_status: string;
      creator_pass_price: number;
    };
    email_verification: {
      is_verified: boolean;
      verification_otp: string;
      verification_otp_expires: string;
      verification_sent_at: string;
    };
    createdAt: string;
    updatedAt: string;
  };
  onboarding_completed: boolean;
}

export interface UserEarnings {
  totalEarnings: number;
  viewsEarnings: number;
  engagementBonus: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalVideos: number;
}

export interface Video {
  id: string;
  title: string;
  thumbnail?: string;
  views: number;
  likes: number;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  type: string;
}

// User Profile APIs
export const getUserProfile = async (token: string) => {
  try {
    const url = `${API_BASE_URL}/api/v1/user/profile`;
    console.log(`Fetching user profile from: ${url}`);
    console.log(`Using token: ${token ? 'Token present' : 'No token'}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log(`User profile response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`HTTP error! status: ${res.status}, response: ${errorText.substring(0, 500)}`);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const responseText = await res.text();
    console.log(`User profile raw response (first 200 chars): ${responseText.substring(0, 200)}`);

    // Check if response starts with HTML (error page)
    if (responseText.trim().startsWith('<')) {
      console.error("Received HTML response instead of JSON:", responseText.substring(0, 200));
      throw new Error("Received HTML response instead of JSON");
    }

    const data = JSON.parse(responseText);
    console.log('✅ getUserProfile successful:', {
      message: data.message,
      username: data.user?.username,
      email: data.user?.email,
      followers: data.user?.followers?.length || 0,
      following: data.user?.following?.length || 0,
      communities: data.user?.my_communities?.length || 0,
      onboarding_completed: data.user?.onboarding_completed
    });
    return data;
  } catch (error) {
    console.error("Failed to get user profile:", error);
    throw error;
  }
};


//Earnings API
export const getUserEarnings = async (token: string) => {
  try {
    console.log(`Fetching user earnings from: ${API_BASE_URL}/api/v1/user/earnings`);

    const res = await fetch(`${API_BASE_URL}/api/v1/user/earnings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log(`User earnings response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Earnings endpoint error: ${res.status}`);
      console.error(`Response: ${errorText.substring(0, 200)}`);

      // Return zeros on error as requested
      return {
        totalEarnings: 0,
        viewsEarnings: 0,
        engagementBonus: 0,
        totalViews: 0,
        totalLikes: 0,
        totalShares: 0,
        totalVideos: 0
      };
    }

    const responseText = await res.text();
    const data = JSON.parse(responseText);
    console.log('✅ getUserEarnings successful:', data);

    // Handle the actual response structure from your API
    if (data.earnings) {
      return data.earnings;
    } else {
      // If no earnings structure, create one from available data
      return {
        totalEarnings: data.total_earned || 0,
        viewsEarnings: data.views_earnings || 0,
        engagementBonus: data.engagement_bonus || 0,
        totalViews: data.total_views || 0,
        totalLikes: data.total_likes || 0,
        totalShares: data.total_shares || 0,
        totalVideos: data.total_videos || 0
      };
    }
  } catch (error) {
    console.error("Failed to get user earnings:", error);
    // Return zeros on error as requested
    return {
      totalEarnings: 0,
      viewsEarnings: 0,
      engagementBonus: 0,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0,
      totalVideos: 0
    };
  }
};// U
//user Videos API
export const getUserVideos = async (
  token: string,
  type: 'uploaded' | 'saved' | 'liked' | 'history' | 'playlist' = 'uploaded',
  page: number = 1,
  limit: number = 10
) => {
  try {
    const url = `${API_BASE_URL}/api/v1/user/videos?type=${type}&page=${page}&limit=${limit}`;
    console.log(`Fetching user videos from: ${url}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Videos endpoint error: ${res.status}`);
      console.error(`Response: ${errorText.substring(0, 200)}`);
      return { videos: [], pagination: { total: 0, page: 1, limit: 10 } };
    }

    const responseText = await res.text();

    if (responseText.trim().startsWith('<')) {
      console.error("❌ Received HTML response instead of JSON");
      return { videos: [], pagination: { total: 0, page: 1, limit: 10 } };
    }

    const data = JSON.parse(responseText);
    console.log('✅ getUserVideos successful:', data);

    // Ensure we always return a videos array
    return {
      videos: Array.isArray(data.videos) ? data.videos : [],
      pagination: data.pagination || { total: 0, page: 1, limit: 10 },
      ...data
    };
  } catch (error) {
    console.error("Failed to get user videos:", error);
    return { videos: [], pagination: { total: 0, page: 1, limit: 10 } };
  }
};

// User Communities API
export const getUserCommunities = async (
  token: string,
  type: 'all' | 'created' | 'joined' = 'all'
) => {
  try {
    const url = `${API_BASE_URL}/api/v1/user/communities?type=${type}`;
    console.log(`Fetching user communities from: ${url}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log(`User communities response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Communities endpoint error: ${res.status}`);
      return { communities: [] };
    }

    const responseText = await res.text();
    const data = JSON.parse(responseText);
    console.log('✅ getUserCommunities successful:', data);

    // Ensure we always return a communities array
    return {
      communities: Array.isArray(data.communities) ? data.communities : [],
      ...data
    };
  } catch (error) {
    console.error("Failed to get user communities:", error);
    return { communities: [] };
  }
};

// User Followers API
export const getUserFollowers = async (token: string) => {
  try {
    const url = `${API_BASE_URL}/api/v1/user/followers`;
    console.log(`Fetching user followers from: ${url}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log(`User followers response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Followers endpoint error: ${res.status}`);
      return { followers: [], count: 0 };
    }

    const responseText = await res.text();
    const data = JSON.parse(responseText);
    console.log('✅ getUserFollowers successful:', data);

    // Ensure we always return a followers array
    return {
      followers: Array.isArray(data.followers) ? data.followers : [],
      count: data.count || (Array.isArray(data.followers) ? data.followers.length : 0),
      ...data
    };
  } catch (error) {
    console.error("Failed to get user followers:", error);
    return { followers: [], count: 0 };
  }
};

// User Interactions API
export const getUserInteractions = async (
  token: string,
  type: 'all' | 'likes' | 'comments' = 'all'
) => {
  try {
    const url = `${API_BASE_URL}/api/v1/user/interactions?type=${type}`;
    console.log(`Fetching user interactions from: ${url}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log(`User interactions response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Interactions endpoint error: ${res.status}`);
      return { interactions: [] };
    }

    const responseText = await res.text();
    const data = JSON.parse(responseText);
    console.log('✅ getUserInteractions successful:', data);

    // Ensure we always return an interactions array
    return {
      interactions: Array.isArray(data.interactions) ? data.interactions : [],
      ...data
    };
  } catch (error) {
    console.error("Failed to get user interactions:", error);
    return { interactions: [] };
  }
};