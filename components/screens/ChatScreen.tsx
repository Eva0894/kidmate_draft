import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Audio } from 'expo-av';
import { useMMKVString } from 'react-native-mmkv';
import { defaultStyles } from '@/constants/Styles';
import HeaderDropDown from '@/components/HeaderDropDown';
import MessageInput from '@/components/MessageInput';
import MessageIdeas from '@/components/MessageIdeas';
import ChatMessage from '@/components/ChatMessage'; 
import { keyStorage, storage } from '@/utils/Storage';
import { Message, Role } from '@/types/message';

const BACKEND_WS = 'ws://10.16.86.220:8000/api/chat/ws/chat';
const BACKEND_HTTP = 'http://10.16.86.220:8000';


// type Message = {
//   role: 'user' | 'bot';
//   content: string;
//   image?: string;
// };

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isDuckTalking, setIsDuckTalking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const fullMessageRef = useRef<string>('');
  const audioQueue = useRef<string[]>([]);
  const isPlaying = useRef<boolean>(false);
  const isFirstAudio = useRef<boolean>(true);

  const [key, setKey] = useMMKVString('apikey', keyStorage);
  const [organization, setOrganization] = useMMKVString('org', keyStorage);
  const [gptVersion, setGptVersion] = useMMKVString('gptVersion', storage);

  const waitForAudioFile = async (url: string, maxRetries: number = 20, interval: number = 300) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) return;
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error('音频文件超时未准备好');
  };

  useEffect(() => {
    const ws = new WebSocket(BACKEND_WS);
    wsRef.current = ws;

    ws.onopen = () => console.log('WebSocket connected');

    ws.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data);
        const text = payload.text;
        const audio = payload.audio;

        if (text) {
          fullMessageRef.current += text;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content = fullMessageRef.current;
            return updated;
          });
        }

        if (audio) {
          audioQueue.current.push(audio);
          if (isFirstAudio.current) {
            isFirstAudio.current = false;
            playNext();
          }
        }
      } catch (err) {
        console.warn('⚠️ JSON parse error:', err);
      }
    };

    ws.onerror = (e) => console.warn('WebSocket error:', e);
    ws.onclose = () => console.log('WebSocket closed');

    return () => ws.close();
  }, []);

  const playNext = async () => {
    if (isPlaying.current || audioQueue.current.length === 0) return;

    isPlaying.current = true;
    const audioPath = audioQueue.current.shift();
    if (!audioPath) {
      isPlaying.current = false;
      return;
    }

    try {
      const sound = new Audio.Sound();
      const fullUrl = `${BACKEND_HTTP}${audioPath}`;
      await waitForAudioFile(fullUrl);
      await sound.loadAsync({ uri: fullUrl });
      await sound.playAsync();

      setIsDuckTalking(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          isPlaying.current = false;
          setIsDuckTalking(false);
          if (audioQueue.current.length === 0) isFirstAudio.current = true;
          playNext();
        }
      });
    } catch (err) {
      console.warn('🔊 音频播放失败:', err);
      isPlaying.current = false;
      setIsDuckTalking(false);
      playNext();
    }
  };

  const isImagePrompt = (input: string): boolean => {
    const lower = input.toLowerCase();
    return (
      lower.includes('画') ||
      lower.includes('生成图片') ||
      lower.includes('draw') ||
      lower.includes('generate image') ||
      lower.includes('picture of') ||
      lower.includes('create a scene')
    );
  };

  const getCompletion = async (message: string) => {
    if (!message.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message },
      { role: 'bot', content: '思考中...', image: undefined },
    ]);

    if (isImagePrompt(message)) {
      try {
        const res = await fetch(`http://localhost:8000/api/chat/generate_image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: message,
            model: 'dall-e-3',
            size: '1024x1024',
            quality: 'standard',
            n: 1,
          }),
        });

        const data = await res.json();
        const imageUrl = data.images?.[0];

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'bot',
            content: '',
            image: imageUrl,
          };
          return updated;
        });
      } catch (err) {
        console.warn('🖼 图像生成失败:', err);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'bot',
            content: '图像生成失败，请稍后重试。',
          };
          return updated;
        });
      }
      return;
    }

    fullMessageRef.current = '';
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'bot',
          content: '连接错误，AI 暂时无法响应。',
        };
        return updated;
      });
    }
  };

  const handleImagePress = (url: string) => {
    setModalImage(url);
    setModalVisible(true);
  };

  if (!key || !organization) {
    return <Redirect href={'/(auth)/(modal)/settings'} />;
  }

  return (
    <View style={defaultStyles.pageContainer}>
      <Stack.Screen
        options={{
          headerTitle: 'ChatGPT',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />

      <View style={styles.page}>
        {/* 🦆 鸭子状态 */}
        <View style={styles.logoContainer}>
          <Image
            source={
              isDuckTalking
                ? require('@/assets/images/duck_open.png')
                : require('@/assets/images/duck_closed.png')
            }
            style={styles.image}
          />
        </View>

        <FlashList
          data={messages}
          renderItem={({ item }) => <ChatMessage {...item} />}
          estimatedItemSize={400}
          contentContainerStyle={{ paddingBottom: 160 }}
          keyboardDismissMode="on-drag"
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={70}
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}
      >
        {messages.length === 0 && <MessageIdeas onSelectCard={getCompletion} />}
        <MessageInput onShouldSend={getCompletion} />
      </KeyboardAvoidingView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalBackground} onPress={() => setModalVisible(false)}>
            <Image
              source={{ uri: modalImage || '' }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  image: {
    width: 240,
    height: 240,
    resizeMode: 'contain',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  modalImage: {
    width: '90%',
    height: '80%',
    borderRadius: 10,
  },
});
