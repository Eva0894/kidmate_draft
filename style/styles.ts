import { StyleSheet } from 'react-native';
import { Platform } from 'react-native';


const meStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fdf9ef',
        paddingHorizontal: 20,
        paddingTop: 40,
    },

    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#E5911B',
        textAlign: 'center',
        fontFamily: Platform.select({
            ios: 'Chalkboard SE',
            android: 'monospace',
        })
    },

    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 30 : 20,
        left: 10,
        paddingVertical: 6,
        paddingHorizontal: 12,
        zIndex: 10,
    },

    searchIcon: {
        marginRight: 8,
    },

    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        fontFamily: Platform.select({
            ios: 'Chalkboard SE',
            android: 'monospace',
        })
    },

    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E5911B',
        fontFamily: Platform.select({
            ios: 'Chalkboard SE',
            android: 'monospace',
        })
    },

    itemText: {
        fontSize: 16,
        color: '#E5911B',
        fontFamily: Platform.select({
            ios: 'Chalkboard SE',
            android: 'monospace',
        })
    },

    content: {
        fontSize: 14,
        lineHeight: 24,
        color: '#444',
    },
});

export default meStyles;