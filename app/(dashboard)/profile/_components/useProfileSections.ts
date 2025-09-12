import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { profileActions, User, Community } from '@/api/profile/profileActions';
import { useAuthStore } from '@/store/useAuthStore';

export type SectionType = 'followers' | 'following' | 'myCommunity' | 'community';

interface UseProfileSectionsProps {
  initialSection?: SectionType;
}

export const useProfileSections = ({ initialSection = 'followers' }: UseProfileSectionsProps = {}) => {
  const { token } = useAuthStore();
  const [activeSection, setActiveSection] = useState<SectionType>(initialSection);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<(User | Community)[]>([]);
  const [counts, setCounts] = useState({
    followers: 0,
    following: 0,
    myCommunity: 0,
    community: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [countsLoaded, setCountsLoaded] = useState(false);

  // Fetch all counts initially
  const fetchAllCounts = useCallback(async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    try {
      // Fetch counts individually to handle failures gracefully
      const results = await Promise.allSettled([
        profileActions.getUserFollowers(token),
        profileActions.getUserFollowing(token),
        profileActions.getUserCombinedCommunities(token, 'all'),
        profileActions.getUserCommunities(token),
      ]);

      const [followersResult, followingResult, myCommunitiesResult, joinedCommunitiesResult] = results;

      setCounts({
        followers: followersResult.status === 'fulfilled' ? (followersResult.value.count || 0) : 0,
        following: followingResult.status === 'fulfilled' ? (followingResult.value.count || 0) : 0,
        myCommunity: myCommunitiesResult.status === 'fulfilled' && Array.isArray(myCommunitiesResult.value.communities) ? myCommunitiesResult.value.communities.length : 0,
        community: joinedCommunitiesResult.status === 'fulfilled' && Array.isArray(joinedCommunitiesResult.value.data) ? joinedCommunitiesResult.value.data.length : 0,
      });

      setCountsLoaded(true);
      
      // Log any failures
      results.forEach((result, index) => {
        const sections = ['followers', 'following', 'myCommunity', 'community'];
        if (result.status === 'rejected') {
          console.error(`❌ Error fetching ${sections[index]} count:`, result.reason);
          // Special handling for Invalid ID format errors
          if (result.reason?.message?.includes('Invalid ID format')) {
            console.error('🔍 Invalid ID format detected - this may indicate a JWT token issue');
          }
        }
      });

      console.log('✅ Fetched counts (with error handling):', {
        followers: followersResult.status === 'fulfilled' ? (followersResult.value.count || 0) : 0,
        following: followingResult.status === 'fulfilled' ? (followingResult.value.count || 0) : 0,
        myCommunity: myCommunitiesResult.status === 'fulfilled' && Array.isArray(myCommunitiesResult.value.communities) ? myCommunitiesResult.value.communities.length : 0,
        community: joinedCommunitiesResult.status === 'fulfilled' && Array.isArray(joinedCommunitiesResult.value.data) ? joinedCommunitiesResult.value.data.length : 0,
      });

    } catch (error) {
      console.error('❌ Error fetching counts:', error);
      // Set default counts on error
      setCounts({
        followers: 0,
        following: 0,
        myCommunity: 0,
        community: 0,
      });
      setCountsLoaded(true);
    }
  }, [token]);

  const fetchData = useCallback(async (section: SectionType) => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result: any;
      
      switch (section) {
        case 'followers':
          result = await profileActions.getUserFollowers(token);
          const followers = Array.isArray(result.followers) ? result.followers : [];
          setData(followers);
          setCounts(prev => ({ ...prev, followers: result.count || 0 }));
          break;
          
        case 'following':
          result = await profileActions.getUserFollowing(token);
          const following = Array.isArray(result.following) ? result.following : [];
          setData(following);
          setCounts(prev => ({ ...prev, following: result.count || 0 }));
          break;
          
        case 'myCommunity':
          result = await profileActions.getUserCombinedCommunities(token, 'all');
          const myCommunities = Array.isArray(result.communities) ? result.communities : [];
          setData(myCommunities);
          setCounts(prev => ({ 
            ...prev, 
            myCommunity: myCommunities.length 
          }));
          break;
          
        case 'community':
          try {
            result = await profileActions.getUserCommunities(token);
            const communities = Array.isArray(result.data) ? result.data : [];
            setData(communities);
            setCounts(prev => ({ 
              ...prev, 
              community: communities.length 
            }));
          } catch (communityError) {
            console.error('❌ Error fetching user communities:', communityError);
            // Special handling for Invalid ID format errors
            if (communityError instanceof Error && communityError.message.includes('Invalid ID format')) {
              console.error('🔍 Invalid ID format detected - JWT token may have invalid user ID');
              setError('Authentication issue detected. Please try logging out and back in.');
            } else {
              setError('Failed to load communities');
            }
            setData([]);
            setCounts(prev => ({ ...prev, community: 0 }));
          }
          break;
      }

      console.log(`✅ Fetched ${section} data:`, result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      console.error(`❌ Error fetching ${section} data:`, error);
      setError(errorMessage);
      setData([]); // Reset data to empty array on error
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const changeSection = useCallback((section: SectionType) => {
    setActiveSection(section);
    fetchData(section);
  }, [fetchData]);

  const refreshCurrentSection = useCallback(() => {
    fetchData(activeSection);
  }, [fetchData, activeSection]);

  const refreshAllCounts = useCallback(() => {
    fetchAllCounts();
  }, [fetchAllCounts]);

  const searchData = useCallback((query: string): (User | Community)[] => {
    // Ensure data is always an array
    const safeData = Array.isArray(data) ? data : [];
    
    if (!query.trim()) {
      return safeData;
    }

    const searchTerm = query.toLowerCase();
    return safeData.filter((item) => {
      if (!item) return false; // Skip null/undefined items
      
      if (activeSection === 'followers' || activeSection === 'following') {
        const user = item as User;
        return user.username?.toLowerCase().includes(searchTerm);
      } else {
        const community = item as Community;
        return community.name?.toLowerCase().includes(searchTerm);
      }
    });
  }, [data, activeSection]);

  // Initial setup - fetch all counts first, then active section data
  useEffect(() => {
    if (!countsLoaded) {
      fetchAllCounts();
    }
    fetchData(activeSection);
  }, [fetchData, fetchAllCounts, activeSection, countsLoaded]);

  const getSectionTitle = useCallback(() => {
    switch (activeSection) {
      case 'followers':
        return `${counts.followers} Followers`;
      case 'following':
        return `${counts.following} Following`;
      case 'myCommunity':
        return `${counts.myCommunity} My Community`;
      case 'community':
        return `${counts.community} Community`;
      default:
        return 'Profile';
    }
  }, [activeSection, counts]);

  return {
    activeSection,
    loading,
    data,
    counts,
    error,
    changeSection,
    refreshCurrentSection,
    refreshAllCounts,
    searchData,
    getSectionTitle,
  };
};