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
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: '#fff8e1',
    padding: 12,
    borderRadius: 8,
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
});