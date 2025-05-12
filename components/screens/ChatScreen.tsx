import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Audio } from 'expo-av';
import MessageInput from '@/components/MessageInput';
import MessageIdeas from '@/components/MessageIdeas';
import ChatMessage from '@/components/ChatMessage';
import { supabase } from '@/utils/Supabase';
import { getBackendUrl, getBookWsUrl } from '@/utils/api';

// const BACKEND_WS = 'ws://localhost:8000/api/chat/ws/chat';
// const BACKEND_HTTP = 'http://localhost:8000';
const BACKEND_HTTP = getBackendUrl();
const BACKEND_WS = `${getBookWsUrl()}/api/chat/ws/chat`;

type Message = {
  role: 'user' | 'bot';
  content: string;
  image?: string;
};

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

  const [user, setUser] = useState<any>(null);
  const [userChecked, setUserChecked] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // ✅ 总是调用 useEffect
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        setShouldRedirect(true);
      }
      setUserChecked(true);
    };
    checkUser();
  }, []);

  // ✅ 不提前 return，只标记跳转
  useEffect(() => {
    if (!user) return;

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
        console.warn(' JSON parse error:', err);
      }
    };

    ws.onerror = (e) => console.warn('WebSocket error:', e);
    ws.onclose = () => console.log('WebSocket closed');

    return () => ws.close();
  }, [user]);

  const waitForAudioFile = async (url: string, maxRetries: number = 20, interval: number = 300) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) return;
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error('The audio file timed out and was not ready.');
  };

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
      console.warn(' Audio playback failed:', err);
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
      { role: 'bot', content: 'dear friends, I am thinking...' },
    ]);

    if (isImagePrompt(message)) {
      try {
        const res = await fetch(`${BACKEND_HTTP}/api/chat/generate_image`, {
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
        console.warn(' Image generation failed:', err);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'bot',
            content: 'Image generation failed, please try again later.',
          };
          return updated;
        });
      }
      return;
    }

    fullMessageRef.current = '';
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'bot',
          content: 'Connection error, AI temporarily unresponsive.',
        };
        return updated;
      });
    }
  };

  const handleImagePress = (url: string) => {
    setModalImage(url);
    setModalVisible(true);
  };

  // ✅ 显示跳转
  if (shouldRedirect) return <Redirect href="/login" />;
  if (!userChecked) return null;

  return (
    <ImageBackground
      source={require('@/assets/images/background.png')}
      style={styles.fullScreenBackground}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: 'Neo goose',
            headerTitleAlign: 'center',
            headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          }}
        />

        <View style={styles.page}>
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

          {messages.length === 0 && (
            <View style={styles.overlay}>
              <Text style={{ fontSize: 16, color: '#000' }}>
                Try asking me a question, or asking me to draw something～
              </Text>
            </View>
          )}

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
              <Image source={{ uri: modalImage || '' }} style={styles.modalImage} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fullScreenBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
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
    width: 190,
    height: 190,
    resizeMode: 'contain',
  },
  overlay: {
    position: 'absolute',
    bottom: 170,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(232, 168, 17, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    zIndex: 99,
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