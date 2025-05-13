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
    backgroundColor: '#FFF7E6',  // 更柔和的浅橙色背景
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,            // 更大的圆角
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    maxWidth: 240,     
    borderWidth: 1,
    borderColor: '#FFE0B2',     
  },
  
  text: {
    fontSize: 16,        
    fontWeight: '600',
    color: '#4B3B2B',        
    letterSpacing: 0.5,       
  },
});