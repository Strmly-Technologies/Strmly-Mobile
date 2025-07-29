import React, { useState, useEffect } from "react";
import { Searchstyles } from "@/styles/Search";
import { View, Text, TextInput, FlatList, ImageBackground, Dimensions, StatusBar, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import ThemedText from "@/components/ThemedText";
import { useSearch } from "./hooks/useSearch";

// Default content shown when not searching (like Instagram's explore page)
const defaultContent = [
    { id: "1", label: "# Startup india", pageURL:'', thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    { id: "2", label: "# Comedy", pageURL:'', thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    { id: "3", label: "# Triller", pageURL:'', thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
    { id: "4", label: "# Startup india", pageURL:'', thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
    { id: "5", label: "# Comedy", pageURL:'', thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
    { id: "6", label: "# Triller", pageURL:'', thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
    { id: "7", label: "# Startup india", pageURL:'', thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
    { id: "8", label: "# Comedy", pageURL:'', thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
    { id: "9", label: "# Triller", pageURL:'', thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
];

const { width } = Dimensions.get("window");
const itemSize = width / 3;

const SearchScreen: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
    const tabs = ["Videos", "Accounts", "Communities"];
    
    const { searchResults, isLoading, error, performSearch, clearSearch } = useSearch();
    
    const [fontsLoaded] = useFonts({
        'Poppins-Regular': require('../../assets/fonts/poppins/Poppins-Regular.ttf'),
        'Poppins-Bold': require('../../assets/fonts/poppins/Poppins-Bold.ttf'),
        'Poppins-SemiBold': require('../../assets/fonts/poppins/Poppins-SemiBold.ttf'),
        'Poppins-Medium': require('../../assets/fonts/poppins/Poppins-Medium.ttf'),
        'Poppins-Light': require('../../assets/fonts/poppins/Poppins-Light.ttf'),
        'Inter-Light': require('../../assets/fonts/inter/Inter-Light.ttf'),
        'Inter-SemiBold': require('../../assets/fonts/inter/Inter-SemiBold.ttf'),
        'Inter-Bold': require('../../assets/fonts/inter/Inter-Bold.ttf'),
        'Inter-ExtraBold': require('../../assets/fonts/inter/Inter-ExtraBold.ttf'),
    });

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                setIsSearchActive(true);
                performSearch(searchQuery);
            } else {
                setIsSearchActive(false);
                clearSearch();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, performSearch, clearSearch]);

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
    };

    const getCurrentTabData = () => {
        if (!isSearchActive) return [];
        
        switch (selectedTab) {
            case 0: return searchResults.videos;
            case 1: return searchResults.accounts;
            case 2: return searchResults.communities;
            default: return [];
        }
    };

    const renderSearchResultItem = ({ item }: { item: any }) => {
        // Determine the image source based on item type
        const getImageSource = () => {
            if (item.posterUrl) return item.posterUrl; // Series
            if (item.thumbnail) return item.thumbnail; // Videos
            if (item.profile_photo || item.profile_picture) return item.profile_photo || item.profile_picture; // Users
            return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'; // Fallback
        };

        // Determine the title based on item type
        const getTitle = () => {
            if (item.title) return item.title; // Series/Videos
            if (item.username) return `@${item.username}`; // Users
            if (item.name) return item.name; // Users
            return 'Untitled';
        };

        // Get additional info based on type
        const getSubtitle = () => {
            if (item.genre) return `${item.genre} • ${item.language || 'Unknown'}`; // Series
            if (item.bio) return item.bio; // Users
            return item.description || '';
        };

        return (
            <TouchableOpacity style={styles.searchResultItem}>
                <ImageBackground
                    source={{ uri: getImageSource() }}
                    style={styles.resultImage}
                    imageStyle={{ resizeMode: 'cover' }}
                >
                    <View style={styles.resultOverlay}>
                        <Text style={styles.resultTitle}>
                            {getTitle()}
                        </Text>
                        {getSubtitle() && (
                            <Text style={styles.resultDescription} numberOfLines={2}>
                                {getSubtitle()}
                            </Text>
                        )}
                        {/* Show additional info for series */}
                        {item.type && (
                            <Text style={styles.resultMeta}>
                                {item.type} • {item.status || 'Unknown'}
                            </Text>
                        )}
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        );
    };

    const renderDefaultItem = ({ item }: { item: any }) => (
        <TouchableOpacity>
            <ImageBackground
                source={{ uri: item.thumbnail }}
                style={style.imageTile}
                imageStyle={{ resizeMode: 'cover' }}
            >
                <Text style={Searchstyles.label}>{item.label}</Text>
            </ImageBackground>
        </TouchableOpacity>
    );

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>LOADING...</Text>
            </View>
        );
    }

return (
    <View style={Searchstyles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        <TextInput
            placeholder="Search"
            placeholderTextColor="#ccc"
            style={Searchstyles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCorrect={false}
            autoCapitalize="none"
        />

        {/* Show tabs only when searching */}
        {isSearchActive && (
            <View style={Searchstyles.SelectionTab}>
                {tabs.map((label, index) => (
                    <TouchableOpacity 
                        style={[
                            Searchstyles.SelectionButton,
                            ...(selectedTab === index ? [Searchstyles.SelectedButton] : [])
                        ]} 
                        key={index} 
                        onPress={() => setSelectedTab(index)}
                    >
                        <ThemedText style={[
                            Searchstyles.Tab, 
                            ...(selectedTab === index ? [Searchstyles.SelectedText] : [])
                        ]}>
                            {label}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>
        )}

        {/* Loading indicator */}
        {isLoading && (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Searching...</Text>
            </View>
        )}

        {/* Error message */}
        {error && (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        )}

        {/* Search suggestions when not searching */}
        {!isSearchActive && !isLoading && (
            <View style={styles.searchSuggestionsContainer}>
                <Text style={styles.searchSuggestionsTitle}>Popular searches</Text>
                <View style={styles.searchChipsContainer}>
                    {['Action', 'Comedy', 'Drama', 'English', 'Hindi'].map((suggestion, index) => (
                        <TouchableOpacity 
                            key={index}
                            style={styles.searchChip}
                            onPress={() => setSearchQuery(suggestion)}
                        >
                            <Text style={styles.searchChipText}>{suggestion}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        )}

        {/* Content */}
        {!isLoading && (
            <FlatList
                data={isSearchActive ? getCurrentTabData() : defaultContent}
                numColumns={isSearchActive ? 1 : 3}
                key={isSearchActive ? 'search' : 'default'} // Force re-render when switching modes
                keyExtractor={(item, index) => 
                    isSearchActive ? `search-${item.id || index}` : `default-${item.id}`
                }
                renderItem={isSearchActive ? renderSearchResultItem : renderDefaultItem}
                contentContainerStyle={isSearchActive ? styles.searchResultsContainer : Searchstyles.grid}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    isSearchActive ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                No {tabs[selectedTab].toLowerCase()} found for "{searchQuery}"
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {selectedTab === 0 && "Try searching for video names or descriptions"}
                                {selectedTab === 1 && "Try searching for usernames or emails"}
                                {selectedTab === 2 && "Try searching for series titles, genres, or languages"}
                            </Text>
                            <View style={styles.suggestionsContainer}>
                                <Text style={styles.suggestionsTitle}>Try searching for:</Text>
                                {selectedTab === 0 && (
                                    <Text style={styles.suggestionText}>• Video names or descriptions</Text>
                                )}
                                {selectedTab === 1 && (
                                    <Text style={styles.suggestionText}>• @username or email addresses</Text>
                                )}
                                {selectedTab === 2 && (
                                    <Text style={styles.suggestionText}>• "Action", "Comedy", "Drama"</Text>
                                )}
                                {selectedTab === 2 && (
                                    <Text style={styles.suggestionText}>• "English", "Hindi", "Tamil"</Text>
                                )}
                            </View>
                        </View>
                    ) : null
                }
            />
        )}
    </View>
);
};


const style = StyleSheet.create({
    imageTile: {
        width: itemSize,
        height: itemSize*1.4,   
        justifyContent: "flex-end",
        alignItems: "flex-start",
    },
});

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontFamily: 'Poppins-Regular',
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
    },
    errorText: {
        color: '#ff6b6b',
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
    },
    searchResultsContainer: {
        padding: 10,
    },
    searchResultItem: {
        marginBottom: 15,
        borderRadius: 10,
        overflow: 'hidden',
    },
    resultImage: {
        width: '100%',
        height: 120,
        justifyContent: 'flex-end',
    },
    resultOverlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 15,
    },
    resultTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 5,
    },
    resultDescription: {
        color: '#ccc',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },
    resultMeta: {
        color: '#999',
        fontSize: 12,
        fontFamily: 'Poppins-Light',
        marginTop: 3,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        color: '#ccc',
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptySubtext: {
        color: '#999',
        fontSize: 14,
        fontFamily: 'Poppins-Light',
        textAlign: 'center',
        marginBottom: 20,
    },
    suggestionsContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    suggestionsTitle: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 8,
    },
    suggestionText: {
        color: '#ccc',
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        marginBottom: 4,
    },
    searchSuggestionsContainer: {
        padding: 20,
        paddingTop: 10,
    },
    searchSuggestionsTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 15,
    },
    searchChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    searchChip: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    searchChipText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },
});

export default SearchScreen;
