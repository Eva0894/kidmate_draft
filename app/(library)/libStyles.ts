import { Platform } from 'react-native';
import { StyleSheet } from 'react-native';

const libStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingHorizontal: 20,
      paddingTop: 40,
    },
    header: {
      textAlign: 'center',     
      alignSelf: 'center', 
      fontSize: 28,
      color: '#ffcc00',
      marginTop: 30,
      marginBottom: 20,
      fontWeight: '800',
      fontFamily: Platform.select({
        ios: 'ChalkboardSE-Regular',
        android: 'monospace',}),
      textShadowColor: '#444',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 0,
    },
      backText: {
        fontSize: 16,
        color: '#D4A017',
        marginLeft: 8,
        fontWeight: '500',
      },
    });

    export default libStyles;