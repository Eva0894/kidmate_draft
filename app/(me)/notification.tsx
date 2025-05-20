import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NotificationToggle from '@/components/NotificationToggle';
import { supabase } from '@/utils/Supabase';
import Constants from 'expo-constants';
import meStyles from './meStyles';

export default function NotificationPage() {
  const router = useRouter();
  const isExpoGo = Constants.appOwnership === 'expo';

  const [notifications, setNotifications] = useState<
    { id: string; title: string; created_at: string }[]
  >([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/me')}>
          <Ionicons name="arrow-back" size={32} color="#E5911B" />
        </TouchableOpacity>
        <Text style={meStyles.header}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 🔔 消息推送开关 */}
      <View style={styles.toggleContainer}>
        <NotificationToggle />
      </View>

      {/* 📬 消息列表 */}
      {notifications.length === 0 ? (
        <Text style={styles.empty}>📭 No notifications yet.</Text>
      ) : (
        notifications.map((note) => (
          <View key={note.id} style={styles.card}>
            <Text style={styles.title}>{note.title}</Text>
            <Text style={styles.time}>
              {new Date(note.created_at).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff9ef',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  toggleContainer: {
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff8e1',
    borderRadius: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  empty: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});