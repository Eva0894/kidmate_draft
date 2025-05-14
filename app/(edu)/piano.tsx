import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native';
import { IconTypes } from 'react-native-ios-context-menu';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

const BASE_URL = 'https://dgizrlyymkxenkeddmdj.supabase.co/storage/v1/object/public/piano-sounds';
const noteSoundMap: Record<string, string> = {
  'C2': `${BASE_URL}/C2.wav`,
  'D2': `${BASE_URL}/D2.wav`,
  'E2': `${BASE_URL}/E2.wav`,
  'F2': `${BASE_URL}/F2.mp3`,
  'G2': `${BASE_URL}/G2.wav`,
  'A2': `${BASE_URL}/A2.mp3`,
  'B2': `${BASE_URL}/B2.mp3`,

  'C3': `${BASE_URL}/C3.mp3`,
  'D3': `${BASE_URL}/D3.mp3`,
  'E3': `${BASE_URL}/E3.mp3`,
  'F3': `${BASE_URL}/F3.mp3`,
  'G3': `${BASE_URL}/G3.mp3`,
  'A3': `${BASE_URL}/A3.mp3`,
  'B3': `${BASE_URL}/B3.mp3`,

  'C4': `${BASE_URL}/C4.mp3`,
  'D4': `${BASE_URL}/D4.mp3`,
  'E4': `${BASE_URL}/E4.mp3`,
  'F4': `${BASE_URL}/F4.mp3`,
  'G4': `${BASE_URL}/G4.mp3`,
  'A4': `${BASE_URL}/A4.mp3`,
  'B4': `${BASE_URL}/B4.mp3`,

  'C5': `${BASE_URL}/C5.mp3`,
  'D5': `${BASE_URL}/D5.mp3`,
  'E5': `${BASE_URL}/E5.mp3`,
  'F5': `${BASE_URL}/F5.mp3`,
  'G5': `${BASE_URL}/G5.mp3`,
  'A5': `${BASE_URL}/A5.mp3`,
  'B5': `${BASE_URL}/B5.mp3`,
};

const whiteNotes = [
  'C2','D2','E2','F2','G2','A2','B2',
  'C3','D3','E3','F3','G3','A3','B3',
  'C4','D4','E4','F4','G4','A4','B4',
  'C5','D5','E5','F5','G5','A5','B5',
];

export default function MusicScreen() {
  const navigation = useNavigation();
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
    };
  
    initialize();
  
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);
  
  const playNote = async (note: string) => {
    try {
      const url = noteSoundMap[note];
      if (!url) return;
  
      console.log('准备播放:', note);
      setActiveNote(note);
  
      // 动态提取文件扩展名
      const extensionMatch = url.match(/\.(\w+)$/);
      const extension = extensionMatch ? extensionMatch[1] : 'mp3';
      const localUri = `${FileSystem.cacheDirectory}${note}.${extension}`;
  
      // 检查缓存
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists) {
        console.log('开始下载:', url);
        await FileSystem.downloadAsync(url, localUri);
        console.log('下载完成:', localUri);
      } else {
        console.log('使用缓存文件:', localUri);
      }
  
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri: localUri }, {}, true);
      await sound.playAsync();
  
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
  
      setTimeout(() => setActiveNote(null), 200);
    } catch (e) {
      console.error('播放失败:', e);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/eduPage')}>
        <Ionicons name='arrow-back' style={styles.backIcon}/>
      </TouchableOpacity>
      <Text style={styles.title}>🎹 Play Your Music!</Text>
      <ScrollView horizontal contentContainerStyle={styles.piano}>
        {whiteNotes.map((note, index) => (
          <TouchableOpacity
            key={note}
            style={[styles.key, styles.whiteKey, activeNote === note && styles.activeKey]}
            onPress={() => playNote(note)}
            activeOpacity={0.7}
          >
            <Text style={styles.keyText}>{note}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const keyWidth = 80;
const whiteKeyHeight = Dimensions.get('window').height * 0.6;

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  backIcon: {
    fontSize: 28,
    color: '#E5911B',
    marginTop: 68,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#E5911B',
    marginTop: 80,
    marginBottom: 20,
    fontWeight: '800',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
    textShadowColor: '#444',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  piano: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
  },
  key: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    paddingBottom: 8,
  },
  whiteKey: {
    width: keyWidth,
    height: whiteKeyHeight,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    zIndex: 0,
  },
  activeKey: {
    backgroundColor: '#ffdb58',
  },
  keyText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
  },
});
