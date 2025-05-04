import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
export default function DinopultGame() {
const navigation = useNavigation();
  useEffect(() => {
    // 锁定为横屏
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      // 离开页面恢复为默认方向
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
        source={{ uri: 'https://springroll-tc.pbskids.org/guess-the-feeling/865cb42df9a791fe368c84be029d3722b19eab78/release/index.html?playOptions=%7B%22game_guid%22%3A%22org.pbskids.danieltiger.guess-the-feeling%22%2C%22language%22%3A%22en%22%7D' }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsFullscreenVideo={true}
        startInLoadingState={true}
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