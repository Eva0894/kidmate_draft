import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import ChatMessage from '@/components/ChatMessage';
import { Ionicons } from '@expo/vector-icons';
import { Role } from '@/utils/Interfaces';
import * as FileSystem from 'expo-file-system';
import { getBookBackendUrl } from '@/utils/apiConfig';

const BACKEND_URL = getBookBackendUrl();

type Message = {
  role: 'user' | 'assistant';
  text: string;
  image?: string;
  timestamp?: string;
};

export default function SessionDetailPage() {
  const { sessionId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  // 映射本地图像路径
  const resolveImagePath = (path?: string) => {
    if (!path) return undefined;
    if (path.startsWith('./images/')) {
      const filename = path.replace('./images/', '');
      return `file://${FileSystem.documentDirectory}generated/${filename}`;
    }
    return path;
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/chat/session/${sessionId}`);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.warn('❌ Failed to fetch chat session:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) fetchSession();
  }, [sessionId]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Chat Detail',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#888" />
      ) : error ? (
        <Text style={styles.errorText}>Failed to load chat session. Please try again later.</Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <ChatMessage
              role={item.role === 'user' ? Role.User : Role.Bot}
              content={item.text}
              image={resolveImagePath(item.image)}
            />
          )}
          contentContainerStyle={{ paddingVertical: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#f00',
    fontSize: 16,
    marginTop: 40,
    textAlign: 'center',
  },
});
