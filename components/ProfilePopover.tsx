import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '@/utils/Supabase';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import iconSet from '@expo/vector-icons/build/Fontisto';

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
      <Text 
        style={styles.text}>
        <Ionicons name="person-outline" style={styles.icon} />
        {profile.username}
      </Text>
      
      <Text 
        style={styles.text}>
        📧 {profile.email}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    backgroundColor: '#FFF7E6', 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,    
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 240,     
    borderWidth: 1,
    borderColor: '#FFE0B2',  
    alignItems: 'flex-start',  
    flexDirection: 'row',  
  },
  
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B3B2B',
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',
    }),                      
  },
  icon: {
    fontSize: 20,
    color: '#E5911B',
    marginRight: 8,
  },
  iconLabel: {
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.select({ ios: 'ChalkboardSE-Regular', android: 'casual' }),
  },
});