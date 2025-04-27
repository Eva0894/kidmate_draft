import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '@/utils/Supabase';

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
      <Text style={styles.text}>👤 {profile.username}</Text>
      <Text style={styles.text}>📧 {profile.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    backgroundColor: '#fffbe8',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    maxWidth: 200,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
});