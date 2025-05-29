import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
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
      console.error('Failed to get the conversation history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[ChatHistory] 组件挂载');
    fetchHistory();
    return () => {
      console.log('[ChatHistory] 组件卸载');
    };
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
            console.error('Deletion failed:', err);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: ChatSession }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/${item.session_id}`)}
      onLongPress={() => deleteHistory(item.session_id)}
    >
      <Text style={styles.preview}>{item.preview || '（无内容）'}</Text>
      <Text style={styles.timestamp}>
        {item.timestamp?.replace('T', ' ').slice(0, 19)}
      </Text>
    </TouchableOpacity>
  );

  const handleGoBack = () => {
    try {
      console.log('[ChatHistory] 尝试返回');
      if (navigation && navigation.canGoBack()) {
        console.log('[ChatHistory] 使用navigation.goBack()');
        router.push('/(tabs)/chat');
      } else {
        console.log('[ChatHistory] 使用router.back()');
        router.back();
      }
    } catch (error) {
      console.error('[ChatHistory] 导航错误:', error);
     router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      {/* 手动实现header，由于Stack.Screen不工作 */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>Chat History</Text>
        <View style={styles.backButton} />
      </View>
      
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
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

