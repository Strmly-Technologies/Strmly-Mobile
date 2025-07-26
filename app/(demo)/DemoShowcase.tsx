import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, BarChart3, Users, CreditCard, Play } from 'lucide-react-native';

const DemoShowcase = () => {
    const router = useRouter();

    const demoScreens = [
        {
            id: 1,
            title: 'Community Analytics',
            description: 'Revenue & Non-revenue analytics for community',
            icon: <BarChart3 size={24} color="white" />,
            route: '/CommunityAnalyticsDemo',
            color: '#3B82F6'
        },
        {
            id: 2,
            title: 'Creator Pass',
            description: 'Premium subscription for creator content',
            icon: <CreditCard size={24} color="white" />,
            route: '/CreatorPassDemo',
            color: '#10B981'
        },
        {
            id: 3,
            title: 'Community Access',
            description: 'Join paid community to upload videos',
            icon: <Users size={24} color="white" />,
            route: '/CommunityAccessDemo',
            color: '#F59E0B'
        },
        {
            id: 4,
            title: 'Series Access',
            description: 'Unlock all episodes in a series',
            icon: <Play size={24} color="white" />,
            route: '/SeriesAccessDemo',
            color: '#EF4444'
        },
        {
            id: 5,
            title: 'Video Access',
            description: 'Buy individual premium videos',
            icon: <Play size={24} color="white" />,
            route: '/VideoAccessDemo',
            color: '#8B5CF6'
        }
    ];

    const handleScreenPress = (route: string | null) => {
        if (route) {
            router.push(route as any);
        }
    };

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            {/* Header */}
            <View className="px-4 py-3 mt-12 mb-6">
                
            </View>

            <ScrollView className="flex-1 px-4">
                {demoScreens.map((screen) => (
                    <TouchableOpacity
                        key={screen.id}
                        onPress={() => handleScreenPress(screen.route)}
                        className="mb-4"
                        disabled={!screen.route}
                    >
                        <View className={`bg-gray-900 rounded-2xl p-6 border-l-4 ${!screen.route ? 'opacity-50' : ''}`} 
                              style={{ borderLeftColor: screen.color }}>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-12 h-12 rounded-full items-center justify-center mr-4"
                                          style={{ backgroundColor: screen.color }}>
                                        {screen.icon}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white text-lg font-semibold mb-1">
                                            {screen.title}
                                        </Text>
                                        <Text className="text-gray-400 text-sm">
                                            {screen.description}
                                        </Text>
                                    </View>
                                </View>
                                {screen.route && (
                                    <ChevronRight size={20} color="#9CA3AF" />
                                )}
                            </View>
                            {!screen.route && (
                                <View className="mt-3 bg-gray-800 rounded-lg px-3 py-2">
                                    <Text className="text-gray-500 text-xs text-center">
                                        Screen not implemented yet
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

              
               
            </ScrollView>
        </View>
    );
};

export default DemoShowcase;