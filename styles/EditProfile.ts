import { StyleSheet } from "react-native";

export const EditProfile = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        paddingTop: 40,
        width: '100%',
        alignItems: 'center'
    },
    CreateCommunityTopBar: {
        width: '100%',
        height: 60,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
    },
    BackIcon: {
        width: 24,
        height: 24,
    },
    CommunityAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10
    },
    InfoContainer: {
        width: '100%',
        textAlign: 'left',
    },
    InfoLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        marginTop: 10,
        marginBottom:2,
    },
    TextLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        marginTop: 10,
    },
    InfoFrame: {
        marginTop: 20,
        marginLeft: 20,
        display: 'flex',
        flexDirection: 'row',
        gap: 20
    },
    wrapper: {
        width: "90%",
        marginTop: 20,
    },
    label: {
        color: "#fff",
        fontFamily: "Poppins-Medium",
        fontSize: 14,
        marginBottom: 5,
    },
    dropdownTrigger: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderColor: "#333",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#000",
    },
    CreatorPassButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderColor: "white",
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 20,
        marginHorizontal:10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#000",
    },
    dropdownText: {
        fontFamily: "Poppins-Medium",
        fontSize: 14,
    },
    arrow: {
        marginLeft: 10,
        fontSize: 14,
        color: "#fff",
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    dropdownBox: {
        backgroundColor: "#111",
        borderRadius: 10,
        paddingVertical: 10,
        width: 200,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    dropdownItemText: {
        color: "#B0B0B0",
        fontFamily: "Poppins-Medium",
        fontSize: 14,
    },
    ExtraInfo: {
        fontFamily: 'Poppins-ExtraLight',
        fontSize: 12,
        opacity: 0.6
    },
    GenderInterestGroup: {
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 30,
        gap: 20,
    },

    FieldWrapper: {
        width: '100%',
    },

    FieldLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#fff',
        marginBottom: 8,
    },
    TopBarTitle: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        color: "#fff",
        textAlign: "center",
    },
    SaveText: {
        fontFamily: "Poppins-Medium",
        fontSize: 14,
        color: "#2196F3",
    },
    EditProfilePicText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: '#2196F3',
        marginBottom: 10,
    },
    TwoFieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        paddingHorizontal: 20,
        marginTop: 10,
    },
    HalfField: {
        flex: 1,
    },
    CreatorPassText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        width: '100%',
    },
});