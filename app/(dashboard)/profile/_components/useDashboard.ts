import { useState, useEffect } from 'react';
import { 
  getUserProfile, 
  getUserVideos, 
  getUserCommunities, 
  getUserFollowers, 
  getUserInteractions,
  getUserEarnings 
} from '@/api/user/userActions';
import { CONFIG } from '@/Constants/config';

interface DashboardStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalReposts: number;
  totalWatchTime: number;
  totalFollowers: number;
  totalVideos: number;
  revenue?: number;
}

interface RevenueBreakdown {
  estimateRevenue: number;
  contentSubscription: number;
  creatorPass: number;
  commentEarning: number;
  giftingEarning: number;
  communityFee: number;
  strmlyAds: number;
}

export const useDashboard = (token: string, activeTab: 'non-revenue' | 'revenue') => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!token) {
      console.error('No auth token available');
      return;
    }

    console.log(`=== SIMPLE DASHBOARD FETCH ===`);
    console.log(`Tab: ${activeTab}`);
    console.log(`Token: ${token ? 'Present' : 'Missing'}`);

    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'non-revenue') {
        console.log('Fetching non-revenue data from all working endpoints...');
        
        // Call all the working endpoints in parallel
        const [userProfile, userVideos, userCommunities, userFollowers, userInteractions] = await Promise.all([
          getUserProfile(token),
          getUserVideos(token, 'uploaded', 1, 100).catch(err => {
            console.error('Failed to fetch user videos:', err);
            return { videos: [] };
          }),
          getUserCommunities(token, 'all').catch(err => {
            console.error('Failed to fetch user communities:', err);
            return { communities: [] };
          }),
          getUserFollowers(token).catch(err => {
            console.error('Failed to fetch user followers:', err);
            return { followers: [], count: 0 };
          }),
          getUserInteractions(token, 'all').catch(err => {
            console.error('Failed to fetch user interactions:', err);
            return { interactions: [] };
          })
        ]);
        
        // Calculate stats from all the data with safe fallbacks
        const user = userProfile?.user;
        const videos = Array.isArray(userVideos?.videos) ? userVideos.videos : [];
        const communities = Array.isArray(userCommunities?.communities) ? userCommunities.communities : [];
        const followers = Array.isArray(userFollowers?.followers) ? userFollowers.followers : 
                         Array.isArray(user?.followers) ? user.followers : [];
        const interactions = Array.isArray(userInteractions?.interactions) ? userInteractions.interactions : [];
        
        console.log('Data validation:', {
          videosCount: videos.length,
          communitiesCount: communities.length,
          followersCount: followers.length,
          interactionsCount: interactions.length,
          userSharedVideos: user?.shared_videos?.length || 0
        });
        
        // Calculate totals with safe operations
        const totalFollowers = followers.length;
        const totalVideos = videos.length;
        const totalViews = videos.reduce((sum: number, video: any) => sum + (video.views || 0), 0);
        const totalLikes = videos.reduce((sum: number, video: any) => sum + (video.likes || 0), 0);
        const totalComments = interactions.filter((i: any) => i?.type === 'comment').length;
        const totalReposts = Array.isArray(user?.shared_videos) ? user.shared_videos.length : 0;
        const totalWatchTime = videos.reduce((sum: number, video: any) => sum + (video.duration || 0), 0);
        
        console.log('✅ Non-revenue data calculated:', {
          totalFollowers,
          totalVideos,
          totalViews,
          totalLikes,
          totalComments,
          totalReposts,
          totalWatchTime
        });
        
        setStats({
          totalViews,
          totalLikes,
          totalComments,
          totalReposts,
          totalWatchTime,
          totalFollowers,
          totalVideos,
        });

      } else {
        console.log('Fetching revenue data...');
        
        // Fetch revenue data from earnings endpoint
        const earnings = await getUserEarnings(token);
        
        console.log('✅ Revenue data received:', earnings);
        
        setStats({
          totalViews: earnings.totalViews,
          totalLikes: earnings.totalLikes,
          totalComments: 0,
          totalReposts: 0,
          totalWatchTime: 0,
          totalFollowers: 0,
          totalVideos: earnings.totalVideos,
          revenue: earnings.totalEarnings
        });

        setRevenueBreakdown({
          estimateRevenue: earnings.totalEarnings,
          contentSubscription: earnings.viewsEarnings,
          creatorPass: 0, // Not available in current API
          commentEarning: 0, // Not available in current API
          giftingEarning: 0, // Not available in current API
          communityFee: 0, // Not available in current API
          strmlyAds: earnings.engagementBonus
        });
      }

    } catch (err: any) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.message);
      
      // Show zeros on error as requested
      setStats({
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalReposts: 0,
        totalWatchTime: 0,
        totalFollowers: 0,
        totalVideos: 0,
        revenue: activeTab === 'revenue' ? 0 : undefined
      });

      if (activeTab === 'revenue') {
        setRevenueBreakdown({
          estimateRevenue: 0,
          contentSubscription: 0,
          creatorPass: 0,
          commentEarning: 0,
          giftingEarning: 0,
          communityFee: 0,
          strmlyAds: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, activeTab]);

  return {
    stats,
    revenueBreakdown,
    loading,
    error,
    refetch: fetchDashboardData
  };
};