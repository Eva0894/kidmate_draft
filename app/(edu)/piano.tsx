import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native';

const noteSoundMap: Record<string, string> = {
  'C2': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/C2.mp3',
  'D2': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/D2.mp3',
  'E2': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/E2.mp3',
  'F2': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/F2.mp3',
  'G2': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/G2.mp3',
  'A2': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/A2.mp3',
  'B2': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/B2.mp3',

  'C3': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/C3.mp3',
  'D3': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/D3.mp3',
  'E3': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/E3.mp3',
  'F3': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/F3.mp3',
  'G3': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/G3.mp3',
  'A3': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/A3.mp3',
  'B3': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/B3.mp3',

  'C4': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/C4.mp3',
  'D4': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/D4.mp3',
  'E4': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/E4.mp3',
  'F4': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/F4.mp3',
  'G4': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/G4.mp3',
  'A4': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/A4.mp3',
  'B4': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/B4.mp3',

  'C5': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/C5.mp3',
  'D5': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/D5.mp3',
  'E5': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/E5.mp3',
  'F5': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/F5.mp3',
  'G5': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/G5.mp3',
  'A5': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/A5.mp3',
  'B5': 'https://raw.githubusercontent.com/Eva0894/5703resource/piano_scale/B5.mp3',
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

  useEffect(() => {
    const lockLandscape = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    lockLandscape();
  
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);
  
  

  const playNote = async (note: string) => {
    const url = noteSoundMap[note];
    if (!url) return;
    setActiveNote(note);
    const { sound } = await Audio.Sound.createAsync({ uri: url });
    await sound.playAsync();
    setTimeout(() => setActiveNote(null), 200);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← back</Text>
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
    backgroundColor: '#444',
    borderRadius: 8,
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: '#e2ac30',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#ffcc00',
    marginTop: 80,
    marginBottom: 20,
    fontWeight: '800',
    fontFamily: 'Cochin',
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
