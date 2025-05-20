import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Stack, Redirect, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MessageInput from '@/components/MessageInput';
import ChatMessage from '@/components/ChatMessage';
import { supabase } from '@/utils/Supabase';
import { Role } from '@/utils/Interfaces';
import { downloadImage } from '@/utils/downloadImage'; 
import { getBookBackendUrl, getBookWsUrl } from '@/utils/apiConfig';

const BACKEND_WS = getBookWsUrl();
const BACKEND_URL = getBookBackendUrl();

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
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
        console.warn('JSON parse error:', err);
      }
    };

    ws.onerror = (e) => console.warn('WebSocket error:', e);
    ws.onclose = () => console.log('WebSocket closed');

    return () => ws.close();
  }, [user]);

  const waitForAudioFile = async (url: string, maxRetries = 20, interval = 300) => {
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
      const fullUrl = `${BACKEND_URL}${audioPath}`;
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
      console.warn('Audio playback failed:', err);
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
      const res = await fetch(`${BACKEND_URL}/api/chat/generate_image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          user_id: user?.id,
          model: 'dall-e-3',
          size: '1024x1024',
          quality: 'standard',
          n: 1,
        }),
      });

      const data = await res.json();
      const imageUrl = data.images?.[0];

      if (!imageUrl) throw new Error('No image returned');

      const localUri = await downloadImage(imageUrl, `image_${Date.now()}`);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'bot',
          content: '',
          image: localUri,
        };
        return updated;
      });
    } catch (err) {
      console.warn('Image generation or download failed:', err);
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
    wsRef.current.send(JSON.stringify({
      user_id: user?.id,
      message: message,
    }));
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
            {isDuckTalking ? (
              <Image
                source={require('@/assets/images/duck_open.png')}
                style={styles.image}
              />
            ) : (
              <TouchableOpacity onPress={() => router.push('/chat_history')}>
                <Image
                  source={require('@/assets/images/duck_closed.png')}
                  style={styles.image}
                />
              </TouchableOpacity>
            )}
          </View>

          <FlashList
            data={messages}
            renderItem={({ item }) => (
              <ChatMessage
                content={item.content}
                image={item.image}
                role={item.role === 'user' ? Role.User : Role.Bot}
              />
            )}
            estimatedItemSize={400}
            contentContainerStyle={{ paddingBottom: 160 }}
            keyboardDismissMode="on-drag"
          />
        </View>

        <View style={{ paddingBottom: insets.bottom, backgroundColor: '#fff' }}>
          <MessageInput onShouldSend={getCompletion} />
        </View>

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
