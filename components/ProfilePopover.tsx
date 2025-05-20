import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { supabase } from '@/utils/Supabase';
import { Ionicons } from '@expo/vector-icons';

interface ProfilePopoverProps {
  visible: boolean;
}

export default function ProfilePopover({ visible }: ProfilePopoverProps) {
  const [profile, setProfile] = useState<{ username: string; email: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('username, email')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('❌ Failed to load profile:', error.message);
      } else {
        const username = data.username || 'Unknown User';
        setProfile({ username, email: data.email });
      }
    };

    if (visible) fetchProfile();
  }, [visible]);

  if (!visible || !profile) return null;

  return (
    <View style={styles.card}>
      <Ionicons name="person-outline" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.username}>{profile.username}</Text>
        <Text style={styles.email}>📮 {profile.email}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    maxWidth: 300,
    marginTop: 10,
  },
  icon: {
    fontSize: 28,
    color: '#E5911B',
    marginRight: 12,
  },
  textContainer: {
    flexDirection: 'column',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B3B2B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',
    }),
  },
  email: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',
    }),
  },
});