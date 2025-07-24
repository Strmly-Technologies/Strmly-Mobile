import { StyleSheet } from "react-native";

export const Searchstyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        paddingTop: 40,
        width: '100%'
    },
    searchInput: {
        fontFamily: 'Poppins-Medium',
        backgroundColor: "transparent",
        borderColor: "white",
        borderWidth: 1,
        color: "#fff",
        padding: 10,
        marginHorizontal: 8,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 15,
    },
    SelectionTab: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row'
    },
    SelectionButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    SelectedButton:{
        borderBottomColor:"white",
        borderBottomWidth:1
    },
    SelectedText: {
        fontSize: 15,
        fontFamily: 'Poppins-Medium',
        textDecorationLine:'underline'
    },
    Tab: {
        textAlign: 'center',
        fontFamily: 'Poppins-Medium',
        fontSize: 15
    },
    grid: {
        width: '100%',
        paddingBottom: 20,
    },
    label: {
        color: "#fff",
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
        paddingHorizontal: 5,
        paddingVertical: 2,
        marginBottom: 5,
    },
});
