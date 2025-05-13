import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import ChatMessage from '@/components/ChatMessage';
import { Ionicons } from '@expo/vector-icons';
import { Role } from '../../../../utils/Interfaces';
import * as FileSystem from 'expo-file-system';

const BACKEND_HTTP = 'http://localhost:8000';

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
  const router = useRouter();

  // ✅ 将 ./images/xxx.png 映射为 file://... 路径
  const resolveImagePath = (path?: string) => {
    if (path?.startsWith('./images/')) {
      const filename = path.replace('./images/', '');
      return `file://${FileSystem.documentDirectory}generated/${filename}`;
    }
    return path; // 兼容远程图片
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${BACKEND_HTTP}/api/chat/session/${sessionId}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.warn('❌ Failed to fetch chat session:', err);
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
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <ChatMessage
              role={item.role as Role}
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
});
