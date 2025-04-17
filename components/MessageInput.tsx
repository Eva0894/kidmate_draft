import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const BACKEND_HTTP = 'http://192.168.10.117:8000';

export type Props = {
  onShouldSend: (message: string) => void;
};

const MessageInput = ({ onShouldSend }: Props) => {
  const [message, setMessage] = useState('');
  const [recordingStarted, setRecordingStarted] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const sendMessage = () => {
    if (message.trim()) {
      onShouldSend(message.trim());
      setMessage('');
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('麦克风权限被拒绝');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setRecordingStarted(true);
    } catch (error) {
      console.error('🎙️ 开始录音失败:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const recording = recordingRef.current;
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      setRecordingStarted(false);

      if (uri) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        const fileUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

        const formData = new FormData();
        formData.append('file', {
          uri,
          type: 'audio/m4a',
          name: 'recording.m4a',
        } as any);

        const res = await fetch(`${BACKEND_HTTP}/stt/recognize`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.text) {
          onShouldSend(data.text);
        } else {
          Alert.alert('语音识别失败');
        }
      }
    } catch (error) {
      console.error('🎙️ 停止录音失败:', error);
      setRecordingStarted(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Message"
        multiline
      />
      {message.trim().length > 0 ? (
        <TouchableOpacity onPress={sendMessage}>
          <FontAwesome name="send" size={22} color="#007aff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPressIn={startRecording} onPressOut={stopRecording}>
          <FontAwesome name="microphone" size={22} color={recordingStarted ? 'red' : 'gray'} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
  },
});

export default MessageInput;
