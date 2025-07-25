import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

interface DashboardStats {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalReposts: number;
    totalWatchTime: number;
    totalFollowers: number;
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

interface RecentActivity {
    id: string;
    user: {
        name: string;
        avatar: string;
    };
    action: 'comment' | 'like' | 'follow' | 'repost' | 'gift' | 'creator_pass' | 'community_join';
    content?: string;
    timestamp: string;
    amount?: number;
}

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState<'non-revenue' | 'revenue'>('non-revenue');
    const [timeFilter, setTimeFilter] = useState('Last 30 Days');
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const { token } = useAuthStore();

    const timeFilterOptions = [
        'Last 7 Days',
        'Last 30 Days',
        'Last 90 Days',
        'Last Year'
    ];

    useEffect(() => {
        fetchDashboardData();
    }, [activeTab, timeFilter]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch dashboard stats
            const statsResponse = await fetch(`/api/dashboard/stats?type=${activeTab}&period=${timeFilter}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            }

            // Fetch recent activity
            const activityResponse = await fetch('/api/dashboard/recent-activity', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (activityResponse.ok) {
                const activityData = await activityResponse.json();
                setRecentActivity(activityData.activities || []);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            Alert.alert('Error', 'Failed to load dashboard data');

            // Mock data for development
            setStats({
                totalViews: 450000,
                totalLikes: 23000,
                totalComments: 23000,
                totalReposts: 23000,
                totalWatchTime: 23000,
                totalFollowers: 23000,
                revenue: activeTab === 'revenue' ? 15000 : undefined
            });

            setRevenueBreakdown({
                estimateRevenue: 345.5,
                contentSubscription: 32,
                creatorPass: 32,
                commentEarning: 32,
                giftingEarning: 32,
                communityFee: 32,
                strmlyAds: 32
            });

            if (activeTab === 'revenue') {
                setRecentActivity([
                    {
                        id: '1',
                        user: { name: 'Rishab raj', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rishab' },
                        action: 'gift',
                        content: 'gift to your comment',
                        timestamp: '13 June 2025',
                        amount: 5.0
                    },
                    {
                        id: '2',
                        user: { name: 'Rishab raj', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rishab' },
                        action: 'gift',
                        content: 'gift to your content',
                        timestamp: '13 June 2025',
                        amount: 5.0
                    },
                    {
                        id: '3',
                        user: { name: 'Rishab raj', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rishab' },
                        action: 'creator_pass',
                        content: 'purchase your creator pass',
                        timestamp: '13 June 2025',
                        amount: 5.0
                    },
                    {
                        id: '4',
                        user: { name: 'Rishab raj', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rishab' },
                        action: 'community_join',
                        content: 'join your community',
                        timestamp: '13 June 2025',
                        amount: 5.0
                    },
                    {
                        id: '5',
                        user: { name: 'Rishab raj', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rishab' },
                        action: 'gift',
                        content: 'gift to your comment',
                        timestamp: '13 June 2025',
                        amount: 5.0
                    }
                ]);
            } else {
                setRecentActivity([
                    {
                        id: '1',
                        user: { name: 'Rishab raj', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rishab' },
                        action: 'comment',
                        content: 'comment on you post',
                        timestamp: '13 June 2025'
                    },
                    {
                        id: '2',
                        user: { name: 'Rishab raj', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rishab' },
                        action: 'like',
                        content: 'like you post',
                        timestamp: '13 June 2025'
                    },
                    {
                        id: '3',
                        user: { name: 'Rishab raj', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rishab' },
                        action: 'follow',
                        content: 'follow you',
                        timestamp: '13 June 2025'
                    },
                    {
                        id: '4',
                        user: { name: 'Rishab raj', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rishab' },
                        action: 'repost',
                        content: 'repost your post',
                        timestamp: '13 June 2025'
                    }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(0)}k`;
        }
        return num.toString();
    };

    const getActionText = (activity: RecentActivity): string => {
        return activity.content || '';
    };

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 mt-12">
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-2xl font-semibold" style={{ fontFamily: 'Poppins' }}>Dashboard</Text>
                <View className="w-6" />
            </View>

            <ScrollView className="flex-1 px-4">
                {/* Tab Switcher */}
                <View className="flex-row mt-6 mb-6">
                    <TouchableOpacity
                        onPress={() => setActiveTab('non-revenue')}
                        className={`flex-1 pb-3 ${activeTab === 'non-revenue' ? 'border-b-2 border-white' : ''}`}
                    >
                        <Text className={`text-center text-xl ${activeTab === 'non-revenue' ? 'text-white font-semibold' : 'text-gray-400'}`} style={{ fontFamily: 'Poppins' }}>
                            Non-revenue
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('revenue')}
                        className={`flex-1 pb-3 ${activeTab === 'revenue' ? 'border-b-2 border-white' : ''}`}
                    >
                        <Text className={`text-center text-xl ${activeTab === 'revenue' ? 'text-white font-semibold' : 'text-gray-400'}`} style={{ fontFamily: 'Poppins' }}>
                            Revenue
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#F1C40F" />
                    </View>
                ) : (
                    <>
                        {/* Stats Card */}
                        <LinearGradient
                            colors={['#000000', '#0a0a0a', '#1a1a1a']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="rounded-2xl p-6 mb-6"
                            style={{ width: 360, height: 273, alignSelf: 'center' }}
                        >
                            {/* Time Filter */}
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-white text-lg font-medium" style={{ fontFamily: 'Inter' }}>
                                    {activeTab === 'revenue' ? 'Estimate Revenue' : 'Total Views'}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowTimeDropdown(!showTimeDropdown)}
                                    className="flex-row items-center border border-gray-600 rounded-lg px-3 py-2"
                                >
                                    <Text className="text-white text-sm mr-2" style={{ fontFamily: 'Inter' }}>{timeFilter}</Text>
                                    <ChevronDown size={16} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Time Filter Dropdown */}
                            {showTimeDropdown && (
                                <View className="absolute right-6 top-20 rounded-lg border border-gray-600 z-10" style={{ backgroundColor: '#0a0a0a' }}>
                                    {timeFilterOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            onPress={() => {
                                                setTimeFilter(option);
                                                setShowTimeDropdown(false);
                                            }}
                                            className="px-4 py-3 border-b border-gray-700 last:border-b-0"
                                        >
                                            <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>{option}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Main Stat */}
                            <Text className="text-white text-3xl font-bold mb-4" style={{ fontFamily: 'Inter' }}>
                                {activeTab === 'revenue'
                                    ? `₹ ${revenueBreakdown?.estimateRevenue || '0'}`
                                    : formatNumber(stats?.totalViews || 0)
                                }
                            </Text>

                            {/* Stats Content */}
                            {activeTab === 'revenue' ? (
                                /* Revenue Breakdown */
                                <View className="space-y-2">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Content subscription</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>₹{revenueBreakdown?.contentSubscription || '0'}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Creator pass</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>₹{revenueBreakdown?.creatorPass || '0'}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Comment earning</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>₹{revenueBreakdown?.commentEarning || '0'}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Gifting earning</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>₹{revenueBreakdown?.giftingEarning || '0'}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Community fee</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>₹{revenueBreakdown?.communityFee || '0'}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Strmly ads</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>₹{revenueBreakdown?.strmlyAds || '0'}</Text>
                                    </View>
                                </View>
                            ) : (
                                /* Non-Revenue Stats */
                                <View className="space-y-2">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Total likes</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>{stats ? formatNumber(stats.totalLikes) : '0'}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Total comments</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>{stats ? formatNumber(stats.totalComments) : '0'}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Total repost</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>{stats ? formatNumber(stats.totalReposts) : '0'}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Total watch time</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>{stats ? formatNumber(stats.totalWatchTime) : '0'}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Total followers</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>{stats ? formatNumber(stats.totalFollowers) : '0'}</Text>
                                    </View>
                                </View>
                            )}
                        </LinearGradient>

                        {/* Recent Activity */}
                        <View className="mb-6">
                            <Text className="text-white text-2xl font-semibold mb-4">Recent</Text>
                            <View className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <View key={activity.id} className="flex-row items-center">
                                        <Image
                                            source={{ uri: activity.user.avatar }}
                                            className="w-10 h-10 rounded-full mr-3"
                                        />
                                        <View className="flex-1">
                                            <Text className="text-white text-lg">
                                                <Text className="font-semibold">{activity.user.name}</Text>
                                                <Text className="text-gray-400"> {getActionText(activity)}</Text>
                                            </Text>
                                            <Text className="text-gray-500 text-base">{activity.timestamp}</Text>
                                        </View>
                                        {activeTab === 'revenue' && activity.amount && (
                                            <Text className="text-white text-lg font-medium">
                                                +₹{activity.amount.toFixed(1)}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

export default Dashboard;