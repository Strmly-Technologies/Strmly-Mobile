import React, { useState } from "react";
import { Searchstyles } from "@/styles/Search";
import { View, Text, TextInput, FlatList, ImageBackground, Dimensions, StatusBar, StyleSheet, TouchableOpacity, } from "react-native";
import { useFonts } from "expo-font";
import ThemedText from "@/components/ThemedText";

const data = [
    { id: "1", label: "# Startup india", pageURL:'' ,thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    { id: "2", label: "# Comedy", pageURL:'' ,thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    { id: "3", label: "# Triller", pageURL:'' ,thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
    { id: "4", label: "# Startup india", pageURL:'' ,thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
    { id: "5", label: "# Comedy", pageURL:'' ,thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
    { id: "6", label: "# Triller", pageURL:'' ,thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
    { id: "7", label: "# Startup india", pageURL:'' ,thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
    { id: "8", label: "# Comedy", pageURL:'' ,thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
    { id: "9", label: "# Triller", pageURL:'' ,thumbnail :'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'},
];

const { width } = Dimensions.get("window");
const itemSize = width / 3;

const SearchScreen: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const tabs = ["Videos", "Accounts", "Communities"];
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

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>LOADING...</Text>
            </View>);
    }

return (
    <View style={Searchstyles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        <TextInput
            placeholder="Search"
            placeholderTextColor="#ccc"
            style={Searchstyles.searchInput}
        />
        <View style={Searchstyles.SelectionTab}>
            {tabs.map((label, index) =>(
            <TouchableOpacity style={[Searchstyles.SelectionButton,...(selectedTab === index ? [Searchstyles.SelectedButton] : [])]} key={index} onPress={() => setSelectedTab(index)}>
            <ThemedText style={[Searchstyles.Tab, ...(selectedTab === index ? [Searchstyles.SelectedText] : [])]}>
                {label}
            </ThemedText></TouchableOpacity>))}
        </View>
        <FlatList
            data={data}
            numColumns={3}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity>
                <ImageBackground
                    source={{uri:item.thumbnail}}
                    style={style.imageTile}
                    imageStyle={{ resizeMode: 'cover' }}
                >
                    <Text style={Searchstyles.label}>{item.label}</Text>
                </ImageBackground></TouchableOpacity>
            )}
            contentContainerStyle={Searchstyles.grid}
        />
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
})

export default SearchScreen;
