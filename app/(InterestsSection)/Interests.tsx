import ThemedText from '@/components/ThemedText'
import ThemedView from '@/components/ThemedView'
import React, { useState } from 'react'
import { useFonts } from 'expo-font';
import { CreateProfileStyles } from '@/styles/createprofile'
import { Image, Text, TouchableOpacity, View, ScrollView } from 'react-native';

const Interests = () => {
    const [Step, setStep] = useState(1)
    const [Type, setType] = useState("Netflix")
    const [Interests, setInterests] = useState<string[]>([]);
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

    const HandleStep = (val: boolean) => {
        if (Step > 1 && !val) {
            setStep(prev => prev - 1);
        }

        if (val) {
            setStep(prev => prev + 1);
        }
    }

    const handleInterestToggle = (item: string) => {
        if (Interests.includes(item)) {
            setInterests(Interests.filter(i => i !== item));
        } else if (Interests.length < 3) {
            setInterests([...Interests, item]);
        }
    }

    const renderGrid = (items: string[]) => {
        const rows = [];
        for (let i = 0; i < items.length; i += 2) {
            rows.push(
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
                    {[0, 1].map(j => {
                        const item = items[i + j];
                        if (!item) return <View key={j} style={{ flex: 1 }} />;
                        const isSelected = Interests.includes(item);
                        return (
                            <TouchableOpacity
                                key={j}
                                onPress={() => handleInterestToggle(item)}
                                style={{
                                    flex: 1,
                                    marginHorizontal: 4,
                                    paddingVertical: 20,
                                    borderWidth: 2,
                                    borderColor: isSelected ? 'transparent' : 'transparent',
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    backgroundColor: '#000',
                                    shadowColor: 'red',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: isSelected ? 0.3 : 0,
                                    shadowRadius: 4,
                                    elevation: isSelected ? 4 : 0,
                                }}>
                                <Text style={{ color: 'white' }}>{item}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            );
        }
        return rows;
    }

    if (!fontsLoaded) return null;

    if (Step === 1) {
        return (
            <ThemedView style={CreateProfileStyles.Container}>
                <ThemedView style={CreateProfileStyles.TopBar}>
                    <TouchableOpacity onPress={() => HandleStep(false)} style={CreateProfileStyles.BackIcon}>
                        <Image source={require('../../assets/icons/back.svg')} />
                    </TouchableOpacity>
                </ThemedView>
                <ThemedView style={CreateProfileStyles.Centered}>
                    <ThemedText style={CreateProfileStyles.Heading}>Pick your kind of content</ThemedText>
                    <ThemedView style={CreateProfileStyles.CardGrid}>
                        <TouchableOpacity onPress={() => { setType("Netflix"); setStep(prev => prev + 1) }} style={CreateProfileStyles.InterestCard}>
                            <ThemedText style={CreateProfileStyles.CardContent}>Netflix</ThemedText>
                            <ThemedText style={CreateProfileStyles.CardContent}>Short films, web series, dramas & movies.</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setType("Youtube"); setStep(prev => prev + 1) }} style={CreateProfileStyles.InterestCard}>
                            <ThemedText style={CreateProfileStyles.CardContent}>Youtube</ThemedText>
                            <ThemedText style={CreateProfileStyles.CardContent}>Vlogs, comedy, food, beauty & Tech.</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        )
    }

    if (Step === 2 || Step === 3) {
        const isCinema = Step === 2;
        const items = isCinema
            ? ['Netflix', 'Youtube', 'Amazon Prime', 'Hotstar', 'Jio Cinema', 'Sony Liv']
            : ['Gaming', 'Podcasts', 'Cooking', 'Fitness', 'Tech Reviews', 'Travel'];
        
        return (
            <ThemedView style={CreateProfileStyles.Container}>
                <View style={CreateProfileStyles.TopBar}>
                    <TouchableOpacity onPress={() => HandleStep(false)} style={CreateProfileStyles.BackIcon}>
                        <Image source={require('../../assets/icons/back.svg')} />
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    <ThemedText style={CreateProfileStyles.Heading}>Your Interests</ThemedText>
                    <ThemedText>Select only 3 of your interest from {isCinema ? '“Cinema content”' : '“Non-cinema content”'}</ThemedText>
                    <View style={{ marginTop: 20 }}>{renderGrid(items)}</View>
                    <TouchableOpacity
                        disabled={Interests.length !== 3}
                        onPress={() => HandleStep(true)}
                        style={CreateProfileStyles.button}
                    >
                        Continue
                    </TouchableOpacity>
                </ScrollView>
            </ThemedView>
        );
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Internal Error, Try restarting the app.</Text>
        </View>
    );
}

export default Interests;
