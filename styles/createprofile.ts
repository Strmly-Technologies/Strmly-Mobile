import { StyleSheet } from 'react-native'

export const CreateProfileStyles = StyleSheet.create({
    TopBar: {
        width: '100%',
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    TopBarTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-Medium',
        color: 'white',
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
    },
    BackIcon: {
        width: 24,
        height: 24,
        position: 'absolute',
        left: 0,
    },
    Text: {
        fontSize: 14,
        fontFamily: 'Poppins-Light',
        color: "#B0B0B0",
        textAlign: "center"
    },
    ExtraBold: {
        fontSize: 16,
        fontFamily: 'Inter-ExtraBold',
        color: "#ffffffff",
        textAlign: "center"
    },
    Input: {
        borderColor: "#B0B0B0",
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        width: 337,
        height: 55,
        color: "#B0B0B0",
        fontFamily: "Inter-Light",
        fontSize: 16
    },
    Container: {
        flex: 1,
        display: "flex",
        gap: 10,
        alignContent:"center",
        alignItems:"center",
        justifyContent: "flex-start",
    },
    button: {
        marginTop: 16,
        width: 333,
        height: 55,
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
        display: "flex",
        justifyContent: 'center',
        alignItems: "center",
        backgroundColor: "white",
        color: "black",
        borderRadius: 100
    }
})