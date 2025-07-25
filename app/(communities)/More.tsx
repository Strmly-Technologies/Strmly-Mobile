import React, { useState } from "react";
import { CommunitiesStyles } from "@/styles/Community";
import { View, Text, FlatList, StatusBar, TouchableOpacity, Image } from "react-native";
import { useFonts } from "expo-font";
import ThemedText from "@/components/ThemedText";
import { CreateProfileStyles } from "@/styles/createprofile";
import ThemedView from "@/components/ThemedView";

const data = [
    { id: "1", Name: "Startup india", pageURL: '', Avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    { id: "2", Name: "Startup india", pageURL: '', Avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    { id: "3", Name: "Startup india", pageURL: '', Avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    { id: "4", Name: "Startup india", pageURL: '', Avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    { id: "5", Name: "Startup india", pageURL: '', Avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    { id: "6", Name: "Startup india", pageURL: '', Avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    { id: "7", Name: "Startup india", pageURL: '', Avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    { id: "8", Name: "Startup india", pageURL: '', Avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    { id: "9", Name: "Startup india", pageURL: '', Avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
];


const MorePage: React.FC = () => {
    const [fontsLoaded] = useFonts({
        'Poppins-Regular': require('../../assets/fonts/poppins/Poppins-Regular.ttf'),
        'Poppins-Bold': require('../../assets/fonts/poppins/Poppins-Bold.ttf'),
        'Poppins-SemiBold': require('../../assets/fonts/poppins/Poppins-SemiBold.ttf'),
        'Poppins-Medium': require('../../assets/fonts/poppins/Poppins-Medium.ttf'),
        'Poppins-Light': require('../../assets/fonts/poppins/Poppins-Light.ttf'),
        'Inter-Light': require('../../assets/fonts/inter/Inter-Light.ttf'),
        'Inter-Regular': require('../../assets/fonts/inter/Inter-Regular.ttf'),
        'Inter-SemiBold': require('../../assets/fonts/inter/Inter-SemiBold.ttf'),
        'Inter-Bold': require('../../assets/fonts/inter/Inter-Bold.ttf'),
        'Inter-ExtraBold': require('../../assets/fonts/inter/Inter-ExtraBold.ttf'),
    });

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>LOADING...</Text>
            </View>);
    }

    return (
        <ThemedView style={CommunitiesStyles.container}>
            <ThemedView style={CreateProfileStyles.TopBar}>
                <ThemedText style={CommunitiesStyles.Tab}>Community</ThemedText>
                <TouchableOpacity
                    style={CreateProfileStyles.BackIcon}>
                    <Image
                        source={require('../../assets/icons/back.svg')}
                    />
                </TouchableOpacity>
            </ThemedView>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <View>
                <FlatList
                    data={data}
                    numColumns={1}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={CommunitiesStyles.followerRow}>
                            <Image
                                source={{ uri: item.Avatar }}
                                style={CommunitiesStyles.followerAvatar}
                            />

                            <View style={CommunitiesStyles.followerInfo}>
                                <Text style={CommunitiesStyles.followerName}>{item.Name}</Text>
                                <Text style={CommunitiesStyles.followerHandle}>@rahulsingh09</Text>
                            </View>

                            <View style={CommunitiesStyles.followerStatsContainer}>
                                <Text style={CommunitiesStyles.followerCount}>5K</Text>
                                <Text style={CommunitiesStyles.followerLabel}>Creators</Text>
                            </View>
                            <View style={CommunitiesStyles.followerStatsContainer}>
                                <Text style={CommunitiesStyles.followerCount}>3.4M</Text>
                                <Text style={CommunitiesStyles.followerLabel}>Followers</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </ThemedView>
    );
};


export default MorePage;
