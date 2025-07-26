import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import { X, Unlock, Calendar, Ban, Heart, Paperclip } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const SeriesAccessDemo = () => {
    const router = useRouter();

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 mt-12">
                <TouchableOpacity onPress={() => router.back()}>
                    <X size={24} color="white" />
                </TouchableOpacity>
                <View className="w-6" />
            </View>

            {/* Content */}
            <View className="flex-1 items-center justify-center px-6">
                {/* Paperclip Icon */}
                <View className="mb-8">
                    <View className="w-20 h-20 rounded-2xl items-center justify-center">
                        <Paperclip size={75} color="white" />
                    </View>
                </View>

                {/* Title */}
                <Text className="text-white text-2xl font-bold mb-2">Series Access</Text>

                {/* Features Card */}
                <View className="w-full max-w-md rounded-2xl mb-8 overflow-hidden">
                    {/* Gradient Border */}
                    <LinearGradient
                        colors={["#4400FFA6", "#FFFFFF", "#FF00004D", "#FFFFFF"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-[2px] rounded-2xl"
                    >
                        {/* Inner Card with Black to Grey Gradient */}
                        <LinearGradient
                            colors={['#000000', '#0a0a0a', '#1a1a1a']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="rounded-2xl p-8"
                        >
                            {/* Feature 1 */}
                            <View className="flex-row items-start mb-8">
                                <View className="mr-6 mt-1">
                                    <Unlock size={28} color="#10B981" />
                                </View>
                                <Text className="text-white text-sm flex-1 leading-6">
                                    Unlock all episodes in this series by @Rishab
                                </Text>
                            </View>

                            {/* Feature 2 */}
                            <View className="flex-row items-start mb-8">
                                <View className="mr-6 mt-1">
                                    <Calendar size={28} color="white" />
                                </View>
                                <Text className="text-white text-sm flex-1 leading-6">
                                    Valid from 1 June to 1 July
                                </Text>
                            </View>

                            {/* Feature 3 */}
                            <View className="flex-row items-start mb-8">
                                <View className="mr-6 mt-1">
                                    <Ban size={28} color="white" />
                                </View>
                                <Text className="text-white text-sm flex-1 leading-6">
                                    Access to all future episodes in this series
                                </Text>
                            </View>

                            {/* Feature 4 */}
                            <View className="flex-row items-start">
                                <View className="mr-6 mt-1">
                                    <Heart size={28} color="#EF4444" fill="#EF4444" />
                                </View>
                                <Text className="text-white text-sm flex-1 leading-6">
                                    Support the creator's ongoing series
                                </Text>
                            </View>
                        </LinearGradient>
                    </LinearGradient>
                </View>

                {/* Join Button */}
                <LinearGradient
                    colors={['#000000', '#0a0a0a', '#1a1a1a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-full"
                >
                    <TouchableOpacity className="px-8 py-4 rounded-full">
                        <Text className="text-white text-lg font-medium">Join at ₹49/series</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </View>
    );
};

export default SeriesAccessDemo;