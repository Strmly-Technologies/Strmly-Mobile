import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { CommunitiesStyles } from "@/styles/Community";
import { CreateCommunityStyle } from "@/styles/CreateCommunity";
import { useFonts } from "expo-font";
import { useState } from "react";
import { Image, Modal, TextInput, TouchableOpacity, View } from "react-native";



const CreateCommunityPage: React.FC = () => {
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
        'Poppins-ExtraLight': require('../../assets/fonts/poppins/Poppins-ExtraLight.ttf'),
    });
    const [visible, setVisible] = useState(false);
    const [selected, setSelected] = useState("");

    const options = ["Free", "Paid"];

    const handleSelect = (value: string) => {
        setSelected(value);
        setVisible(false);
    };


    return (
        <ThemedView style={CreateCommunityStyle.container}>
            <View style={CreateCommunityStyle.CreateCommunityTopBar}>
                <TouchableOpacity
                    style={CreateCommunityStyle.BackIcon}>
                    <Image
                        source={require('../../assets/icons/back.svg')}
                    />
                </TouchableOpacity>
                <ThemedText style={CommunitiesStyles.Tab}>Create Community</ThemedText>
                <ThemedText style={CommunitiesStyles.RightTab}>Create</ThemedText>
            </View>

            <Image
                source={require('../../assets/icons/ProfilePlaceHolder.svg')}
                style={CreateCommunityStyle.CommunityAvatar}
            />
            <ThemedText style={CommunitiesStyles.RightTab}>Add community picture</ThemedText>
            <View style={CreateCommunityStyle.InfoContainer}>
                <View style={CreateCommunityStyle.InfoFrame}>
                    <ThemedText style={CreateCommunityStyle.InfoLabel}>Community name</ThemedText>
                    <TextInput placeholder="Add name" placeholderTextColor="#B0B0B0" style={CreateCommunityStyle.TextLabel} />
                </View>
                <View style={CreateCommunityStyle.InfoFrame}>
                    <ThemedText style={CreateCommunityStyle.InfoLabel}>Bio</ThemedText>
                    <TextInput placeholder="Add bio" placeholderTextColor="#B0B0B0" style={CreateCommunityStyle.TextLabel} />
                </View>
                <View style={CreateCommunityStyle.InfoFrame}>
                    <ThemedText style={CreateCommunityStyle.InfoLabel}>Access</ThemedText>
                    <TouchableOpacity onPress={() => setVisible(true)} style={CreateCommunityStyle.dropdownTrigger}>
                        <ThemedText style={[CreateCommunityStyle.dropdownText, { color: selected ? "#fff" : "#888" }]}>
                            {selected || "Select"}
                        </ThemedText>
                        <ThemedText style={CreateCommunityStyle.arrow}>▼</ThemedText>
                    </TouchableOpacity>

                    <Modal transparent animationType="fade" visible={visible}>
                        <TouchableOpacity style={CreateCommunityStyle.overlay} onPress={() => setVisible(false)}>
                            <View style={CreateCommunityStyle.dropdownBox}>
                                {options.map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        style={CreateCommunityStyle.dropdownItem}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <ThemedText style={CreateCommunityStyle.dropdownItemText}>{item}</ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </View>

                
                <View style={CreateCommunityStyle.InfoFrame}>
                    <Modal transparent animationType="fade" visible={visible}>
                        <TouchableOpacity style={CreateCommunityStyle.overlay} onPress={() => setVisible(false)}>
                            <View style={CreateCommunityStyle.dropdownBox}>
                                {options.map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        style={CreateCommunityStyle.dropdownItem}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <ThemedText style={CreateCommunityStyle.dropdownItemText}>{item}</ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </View>
                
                {selected === 'Paid' && (<View style={CreateCommunityStyle.InfoFrame}><View>
                    <ThemedText style={CreateCommunityStyle.InfoLabel}>Creator Strength</ThemedText>
                    <TextInput placeholder="500" placeholderTextColor="#B0B0B0" style={CreateCommunityStyle.TextLabel} /></View>
                    <View>
                    <ThemedText style={CreateCommunityStyle.InfoLabel}>Community fee</ThemedText>
                    <TextInput placeholder="₹29/m" placeholderTextColor="#B0B0B0" style={CreateCommunityStyle.TextLabel} /></View>
                </View>)}
            </View>

            <ThemedView style={CreateCommunityStyle.container}>
                <ThemedText style={CreateCommunityStyle.ExtraInfo}>You can create either a free or paid community. In a free</ThemedText>
                <ThemedText style={CreateCommunityStyle.ExtraInfo}>community, anyone can join, follow, and post content.</ThemedText>
                <br/>
                <ThemedText style={CreateCommunityStyle.ExtraInfo}>In a paid community, users can join and watch videos for free,</ThemedText>
                <ThemedText style={CreateCommunityStyle.ExtraInfo}>but only creators who pay can post content.</ThemedText>
            </ThemedView>
        </ThemedView>
    );
}


export default CreateCommunityPage;