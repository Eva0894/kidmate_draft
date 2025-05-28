import React, { useEffect } from 'react';
import { View, StyleSheet,TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';

export default function MarblerunGame() {
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
              <Ionicons name="arrow-back" size={24} color="#E5911B" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
      <WebView
        source={{ uri: 'https://springroll-tc.pbskids.org/ebe187b1-a07f-44c5-b16a-348db058ccc0/67fc5e9c176d7fa78f45abfb7eb464d87012b956/release/index.html?playOptions=%5B%5D' }}
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
        backgroundColor: '#fff4e6',
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