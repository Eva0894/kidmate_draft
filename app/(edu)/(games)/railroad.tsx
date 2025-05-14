import React, { useEffect } from 'react';
import { View, StyleSheet,TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
export default function RosieSlimeShopGame() {
  const navigation = useNavigation();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* 返回按钮 */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#E5911B" />
    
      </TouchableOpacity>
      <WebView
        source={{ uri: 'https://springroll-tc.pbskids.org/railroad-repair-reboot/3bb72f0bad3b1497aa5ad0fa3849e4100c328e51/release/index.html?playOptions=%7B%22language%22%3A%22en%22%2C%22game_guid%22%3A%22a6affecc-f491-11e7-975b-22000a8e97c6%22%7D' }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 40,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        zIndex: 1,
      },
      backText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#E5911B',
        fontWeight: 'bold',
      },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});