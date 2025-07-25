import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import VideoUploadFlow from '../upload/VideoUploadFlow';
import { SeriesSelectionScreen, SeriesAnalyticsScreen } from './screens';
import SimpleSeriesCreationScreen from './screens/SimpleSeriesCreationScreen';
import { Series } from './types';

interface DraftItem {
    id: string;
    title: string;
    date: string;
}

interface SeriesItem {
    id: string;
    title: string;
    date: string;
    totalEpisodes: string;
    isSelected?: boolean;
}

const StrmlyStudio = () => {
    const [activeTab, setActiveTab] = useState<'draft' | 'series'>('draft');
    const [selectedSeries, setSelectedSeries] = useState<string | null>('3');
    const [showUploadFlow, setShowUploadFlow] = useState(false);
    const [showSeriesSelection, setShowSeriesSelection] = useState(false);
    const [showSeriesCreationScreen, setShowSeriesCreationScreen] = useState(false);
    const [showSeriesAnalytics, setShowSeriesAnalytics] = useState(false);
    const [selectedSeriesForAnalytics, setSelectedSeriesForAnalytics] = useState<Series | null>(null);

    const drafts: DraftItem[] = [
        { id: '1', title: 'Draft: 01', date: 'Draft on 15 Jun, 11:29 AM' },
        { id: '2', title: 'Draft: 01', date: 'Draft on 15 Jun, 11:29 AM' },
        { id: '3', title: 'Draft: 01', date: 'Draft on 15 Jun, 11:29 AM' },
        { id: '4', title: 'Draft: 01', date: 'Draft on 15 Jun, 11:29 AM' },
        { id: '5', title: 'Draft: 01', date: 'Draft on 15 Jun, 11:29 AM' },
    ];

    const series: SeriesItem[] = [
        { id: '1', title: 'Squid Game Season 1', date: 'Launch on 15 Jun, 11:29 AM', totalEpisodes: '01' },
        { id: '2', title: 'Squid Game Season 1', date: 'Launch on 15 Jun, 11:29 AM', totalEpisodes: '01' },
        { id: '3', title: 'Squid Game Season 1', date: 'Launch on 15 Jun, 11:29 AM', totalEpisodes: '01' },
        { id: '4', title: 'Squid Game Season 1', date: 'Launch on 15 Jun, 11:29 AM', totalEpisodes: '01' },
        { id: '5', title: 'Squid Game Season 1', date: 'Launch on 15 Jun, 11:29 AM', totalEpisodes: '01' },
        { id: '6', title: 'Squid Game Season 1', date: 'Launch on 15 Jun, 11:29 AM', totalEpisodes: '01' },
    ];

    // Handle upload flow completion
    const handleUploadComplete = () => {
        setShowUploadFlow(false);
        // TODO: Refresh drafts list from API
        console.log('Upload completed successfully');
    };

    // Handle upload flow cancellation
    const handleUploadCancel = () => {
        setShowUploadFlow(false);
    };

    // Handle series selection - now shows creation screen first
    const handleSeriesSelected = (series: Series) => {
        setShowSeriesSelection(false);
        setShowSeriesCreationScreen(true);
        console.log('Series selected:', series.title);
    };

    // Handle series creation from selection screen - now also uses full screen
    const handleAddNewSeries = () => {
        setShowSeriesSelection(false);
        setShowSeriesCreationScreen(true);
    };

    // Handle series creation screen back
    const handleSeriesCreationScreenBack = () => {
        setShowSeriesCreationScreen(false);
        setShowSeriesSelection(true); // Go back to series selection
    };

    // Handle series creation completion - navigate to analytics
    const handleSeriesCreatedFromScreen = (series: Series) => {
        setShowSeriesCreationScreen(false);
        setSelectedSeriesForAnalytics(series);
        setShowSeriesAnalytics(true);
        console.log('Series created and navigating to analytics:', series.title);
    };

    // Handle back from series selection
    const handleSeriesSelectionBack = () => {
        setShowSeriesSelection(false);
    };

    // Handle series analytics navigation
    const handleSeriesAnalyticsBack = () => {
        setShowSeriesAnalytics(false);
        setSelectedSeriesForAnalytics(null);
    };

    const handleEditAccess = () => {
        console.log('Edit access clicked');
        // TODO: Show edit access modal
    };

    const handleAddNewEpisode = () => {
        console.log('Add new episode clicked');
        // TODO: Navigate to episode creation
    };

    const handleEpisodeMenuPress = (episodeId: string) => {
        console.log('Episode menu pressed:', episodeId);
        // TODO: Show episode options menu
    };

    // Show upload flow if active
    if (showUploadFlow) {
        return (
            <VideoUploadFlow
                onComplete={handleUploadComplete}
                onCancel={handleUploadCancel}
            />
        );
    }

    // Show series selection if active
    if (showSeriesSelection) {
        return (
            <SeriesSelectionScreen
                onBack={handleSeriesSelectionBack}
                onSeriesSelected={handleSeriesSelected}
                onAddNewSeries={handleAddNewSeries}
            />
        );
    }

    // Show series creation screen if active
    if (showSeriesCreationScreen) {
        return (
            <SimpleSeriesCreationScreen
                onBack={handleSeriesCreationScreenBack}
                onSeriesCreated={handleSeriesCreatedFromScreen}
            />
        );
    }

    // Show series analytics if active
    if (showSeriesAnalytics && selectedSeriesForAnalytics) {
        return (
            <SeriesAnalyticsScreen
                series={selectedSeriesForAnalytics}
                onBack={handleSeriesAnalyticsBack}
                onEditAccess={handleEditAccess}
                onAddNewEpisode={handleAddNewEpisode}
                onEpisodeMenuPress={handleEpisodeMenuPress}
            />
        );
    }



    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 mt-12">
                <TouchableOpacity>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-2xl font-medium">Strmly studio</Text>
                <View className="w-6" />
            </View>

            {/* Tab Navigation */}
            <View className="flex-row py-4">
                <TouchableOpacity
                    className="flex-1 items-center"
                    onPress={() => setActiveTab('draft')}
                >
                    <Text className={`text-2xl font-medium ${activeTab === 'draft' ? 'text-white' : 'text-gray-400'}`}>
                        My draft
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 items-center"
                    onPress={() => setActiveTab('series')}
                >
                    <Text className={`text-2xl font-medium ${activeTab === 'series' ? 'text-white' : 'text-gray-400'}`}>
                        Series
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content List */}
            <ScrollView className="flex-1 px-4">
                {activeTab === 'draft' ? (
                    // Drafts List
                    drafts.map((draft) => (
                        <LinearGradient
                            key={draft.id}
                            colors={['#000000', '#0a0a0a', '#1a1a1a']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="flex-row items-center rounded-lg p-3 mb-3"
                            style={{
                                shadowColor: '#ffffff',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 3,
                            }}
                        >
                            <View className="w-12 h-12 rounded-lg mr-3 overflow-hidden">
                                <Image
                                    source={require('../../assets/images/draft-thumb.png')}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            </View>

                            <View className="flex-1">
                                <Text className="text-white text-lg font-medium">{draft.title}</Text>
                                <Text className="text-gray-400 text-base">{draft.date}</Text>
                            </View>

                            <TouchableOpacity className="p-2">
                                <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </LinearGradient>
                    ))
                ) : (
                    // Series List
                    series.map((seriesItem) => (
                        <TouchableOpacity
                            key={seriesItem.id}
                            onPress={() => setSelectedSeries(seriesItem.id)}
                        >
                            <LinearGradient
                                colors={['#000000', '#0a0a0a', '#1a1a1a']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className={`flex-row items-center rounded-lg p-3 mb-3 ${selectedSeries === seriesItem.id ? 'border-2 border-blue-500' : ''
                                    }`}
                                style={{
                                    shadowColor: '#ffffff',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 3,
                                }}
                            >
                                <View className="w-12 h-12 mr-3 items-center justify-center">
                                    <View className="w-10 h-8 border-2 border-white rounded items-center justify-center">
                                        <View className="w-6 h-4 border border-white rounded" />
                                    </View>
                                </View>

                                <View className="flex-1">
                                    <Text className="text-white text-lg font-medium">{seriesItem.title}</Text>
                                    <Text className="text-gray-400 text-base">{seriesItem.date}</Text>
                                </View>

                                <View className="items-end mr-3">
                                    <Text className="text-gray-400 text-sm">Total Episode</Text>
                                    <Text className="text-white text-base font-medium">{seriesItem.totalEpisodes}</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Bottom Section */}
            <View className="px-4 pb-8">
                {/* Action Button */}
                <TouchableOpacity 
                    className="bg-gray-200 rounded-full py-4 items-center"
                    onPress={() => {
                        if (activeTab === 'draft') {
                            setShowUploadFlow(true);
                        } else {
                            // Show series selection screen
                            setShowSeriesSelection(true);
                        }
                    }}
                >
                    <Text className="text-black text-lg font-medium">
                        {activeTab === 'draft' ? 'Upload new video' : 'Add new series'}
                    </Text>
                </TouchableOpacity>
            </View>


        </View>
    );
};

export default StrmlyStudio;