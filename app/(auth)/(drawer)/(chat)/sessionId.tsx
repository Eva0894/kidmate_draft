import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ChatMessage from '@/components/ChatMessage'; 
import { getBackendUrl } from '@/utils/api';

const BACKEND_HTTP = getBackendUrl();

type Message = {
  role: 'user' | 'bot';
  text: string;
  image?: string;
};

export default function SessionDetailPage() {
  const { sessionId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${BACKEND_HTTP}/api/chat/session/${sessionId}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.warn(' Failed to obtain chat history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <ChatMessage
              role={item.role}
              content={item.text}   
              image={item.image}   
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
