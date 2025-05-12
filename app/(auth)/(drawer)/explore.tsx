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
import { useRouter } from 'expo-router'; 
import { getBackendUrl } from '@/utils/api';

const BACKEND_HTTP = getBackendUrl();

type ChatSession = {
  session_id: string;
  preview: string;
  timestamp: string;
};

export default function ExplorePage() {
  const [loading, setLoading] = useState(true);
  // const [history, setHistory] = useState([]);
  const router = useRouter(); 
  const [history, setHistory] = useState<ChatSession[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_HTTP}/api/chat/chat_history`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.warn('Failed to get the conversation history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    const interval = setInterval(fetchHistory, 5000); 

    return () => clearInterval(interval); 
  }, []);

  const deleteHistory = async (session_id:string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this chat history?', [
      { text: 'cancel', style: 'cancel' },
      {
        text: 'delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${BACKEND_HTTP}/api/chat/chat_history/${session_id}`, {
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
      onPress={() => router.push(`/(chat)/detail/${item.session_id}`)} 
      onLongPress={() => deleteHistory(item.session_id)}
    >
      <Text style={styles.preview}>{item.preview || '（无内容）'}</Text>
      <Text style={styles.timestamp}>
        {item.timestamp?.replace('T', ' ').slice(0, 19)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat history</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#888" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.session_id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
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
});
