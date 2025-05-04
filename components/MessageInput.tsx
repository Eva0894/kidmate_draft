import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const BACKEND_URL = 'http://localhost:8000'; // 你的后端地址

export type Props = {
  onShouldSend: (message: string) => void;
};

const MessageInput = ({ onShouldSend }: Props) => {
  const [message, setMessage] = useState('');
  const [recordingStarted, setRecordingStarted] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    onShouldSend(message);
    setMessage('');
  };

  const handleMicPressIn = async () => {
    try {
      console.log('🎤 开始录音');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();

      const recordingOptions: Audio.RecordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: 3, // THREE_GPP
          audioEncoder: 1, // AMR_NB
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: 2, // HIGH = 2
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      };

      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();
      recordingRef.current = recording;
      setRecordingStarted(true);
    } catch (err) {
      console.warn('🎤 开始录音失败:', err);
      Alert.alert('错误', '无法开始录音');
    }
  };

  const handleMicPressOut = async () => {
    try {
      console.log('🛑 停止录音');
      setRecordingStarted(false);
      const recording = recordingRef.current;
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error('未找到录音文件');

      console.log('📁 上传录音文件:', uri);

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'recording.wav',
        type: 'audio/wav',
      } as any);

      const response = await fetch(`${BACKEND_URL}/stt/recognize`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      if (!response.ok || !result.text) {
        throw new Error(result.detail || '语音识别失败');
      }

      console.log('🗣️ 识别文本:', result.text);
      onShouldSend(result.text);
    } catch (err: any) {
      console.warn('❌ 语音识别出错:', err);
      Alert.alert('识别失败', err.message || '语音识别失败');
    } finally {
      recordingRef.current = null;
    }
  };

  return (
    <View style={styles.containerWrapper}>
      <View style={styles.container}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Message"
          placeholderTextColor="#aaa"
          multiline
        />
        {message.length > 0 ? (
          <TouchableOpacity onPress={handleSendMessage}>
            <FontAwesome name="send" size={24} color="#007aff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPressIn={handleMicPressIn}
            onPressOut={handleMicPressOut}
          >
            <FontAwesome
              name="microphone"
              size={24}
              color={recordingStarted ? 'red' : 'gray'}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 16,
    marginRight: 10,
    backgroundColor: '#fff',
  },
});

export default MessageInput;