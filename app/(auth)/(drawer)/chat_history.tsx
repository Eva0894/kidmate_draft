import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/Supabase'; 
import { getBookBackendUrl } from '@/utils/apiConfig';

const BACKEND_URL = getBookBackendUrl();

type ChatSession = {
  session_id: string;
  preview: string;
  timestamp: string;
};

export default function ChatHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<ChatSession[]>([]);
  const router = useRouter();
  const navigation = useNavigation();

  const fetchHistory = async () => {
    try {
      const { data } = await supabase.auth.getUser(); 
      const userId = data?.user?.id;
      if (!userId) {
        console.warn('No user logged in');
        return;
      }

      const res = await fetch(`${BACKEND_URL}/api/chat/chat_history?user_id=${userId}`);
      const dataJson = await res.json();
      setHistory(dataJson);
    } catch (err) {
      console.warn('Failed to get the conversation history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const deleteHistory = async (session_id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this chat history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${BACKEND_URL}/api/chat/chat_history/${session_id}`, {
              method: 'DELETE',
            });
            setHistory((prev) => prev.filter((item) => item.session_id !== session_id));
          } catch (err) {
            console.warn('Deletion failed:', err);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: ChatSession }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(auth)/(chat)/${item.session_id}`)}
      onLongPress={() => deleteHistory(item.session_id)}
    >
      <Text style={styles.preview}>{item.preview || '(No content)'}</Text>
      <Text style={styles.timestamp}>
        {item.timestamp?.replace('T', ' ').slice(0, 19)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Chat History',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#888" style={{ marginTop: 30 }} />
        ) : history.length === 0 ? (
          <Text style={styles.emptyText}>No chat history</Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.session_id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  preview: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 40,
  },
});
