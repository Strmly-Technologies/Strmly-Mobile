import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { CommunitiesStyles } from "@/styles/Community";
import { EditProfile } from "@/styles/EditProfile";
import { useFonts } from "expo-font";
import { useState } from "react";
import { Image, Modal, TextInput, TouchableOpacity, View } from "react-native";

const EditProfilePage: React.FC = () => {
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
    const options = ["Male", "Female"];

    const handleSelect = (value: string) => {
        setSelected(value);
        setVisible(false);
    };

    return (
        <ThemedView style={EditProfile.container}>
            {/* Top Bar */}
            <View style={EditProfile.CreateCommunityTopBar}>
                <TouchableOpacity style={EditProfile.BackIcon}>
                    <Image source={require('../../assets/icons/back.svg')} />
                </TouchableOpacity>
                <ThemedText style={EditProfile.TopBarTitle}>Samarth Gupta</ThemedText>
                <TouchableOpacity>
                    <ThemedText style={EditProfile.SaveText}>Save</ThemedText>
                </TouchableOpacity>
            </View>

            {/* Profile Picture */}
            <Image source={require('../../assets/icons/ProfilePlaceHolder.svg')} style={EditProfile.CommunityAvatar} />
            <TouchableOpacity>
                <ThemedText style={EditProfile.EditProfilePicText}>Edit profile picture</ThemedText>
            </TouchableOpacity>

            {/* Inputs */}
            <View style={EditProfile.InfoContainer}>
                {["Name", "Username", "Bio"].map(label => (
                    <View key={label} style={EditProfile.InfoFrame}>
                        <ThemedText style={EditProfile.InfoLabel}>{label}</ThemedText>
                        <TextInput
                            placeholder={`Add ${label.toLowerCase()}`}
                            placeholderTextColor="#B0B0B0"
                            style={EditProfile.TextLabel}
                        />
                    </View>
                ))}

                {/* Gender & Content Interest */}
                <View style={EditProfile.TwoFieldRow}>
                    <View style={EditProfile.HalfField}>
                        <ThemedText style={EditProfile.InfoLabel}>Gender</ThemedText>
                        <TouchableOpacity onPress={() => setVisible(true)} style={EditProfile.dropdownTrigger}>
                            <ThemedText style={[EditProfile.dropdownText, { color: selected ? "#fff" : "#888" }]}>
                                {selected || "Select"}
                            </ThemedText>
                            <ThemedText style={EditProfile.arrow}>▼</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={EditProfile.HalfField}>
                        <ThemedText style={EditProfile.InfoLabel}>Content interest</ThemedText>
                        <TouchableOpacity onPress={() => setVisible(true)} style={EditProfile.dropdownTrigger}>
                            <ThemedText style={[EditProfile.dropdownText, { color: selected ? "#fff" : "#888" }]}>
                                {selected || "Select"}
                            </ThemedText>
                            <ThemedText style={EditProfile.arrow}>▼</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Interest 1 & 2 */}
                {["Interest 1", "Interest 2"].map((interest, i) => (
                    <View key={i} style={EditProfile.InfoFrame}>
                        <ThemedText style={EditProfile.InfoLabel}>{interest}</ThemedText>
                        <TouchableOpacity onPress={() => setVisible(true)} style={EditProfile.dropdownTrigger}>
                            <ThemedText style={[EditProfile.dropdownText, { color: selected ? "#fff" : "#888" }]}>
                                {selected || "Crime, Comedy, romance"}
                            </ThemedText>
                            <ThemedText style={EditProfile.arrow}>▶</ThemedText>
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Dropdown Modal (shared) */}
                <Modal transparent animationType="fade" visible={visible}>
                    <TouchableOpacity style={EditProfile.overlay} onPress={() => setVisible(false)}>
                        <View style={EditProfile.dropdownBox}>
                            {options.map((item) => (
                                <TouchableOpacity key={item} style={EditProfile.dropdownItem} onPress={() => handleSelect(item)}>
                                    <ThemedText style={EditProfile.dropdownItemText}>{item}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Creator Pass Button */}
                <TouchableOpacity style={EditProfile.CreatorPassButton}>
                    <ThemedText style={EditProfile.CreatorPassText}>Add “CREATOR PASS”</ThemedText>
                </TouchableOpacity>

                {/* Extra Info */}
                <View style={{ marginTop: 10, paddingHorizontal: 20 }}>
                    <ThemedText style={EditProfile.ExtraInfo}>
                        Unlock Creator pass for your fans. All your paid content will be
                    </ThemedText>
                    <ThemedText style={EditProfile.ExtraInfo}>
                        freely available to users who purchase your Creator Pass.
                    </ThemedText>
                </View>
            </View>
        </ThemedView>
    );
};

export default EditProfilePage;
