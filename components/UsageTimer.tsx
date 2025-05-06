// components/UsageTimer.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/Supabase';

const API = 'http://192.168.0.94:3000/api/parental-control';

export default function UsageTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let userId: string | null = null;
    async function fetchStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;
      userId = user.id;

      const res = await fetch(`${API}/users/${userId}/usage-status`);
      if (!res.ok) return;
      const { remaining_seconds } = await res.json();

      setRemaining(
        remaining_seconds === null
          ? null
          : Math.floor(remaining_seconds / 60)
      );
    }

    fetchStatus();
    const iv = setInterval(fetchStatus, 60_000);
    return () => clearInterval(iv);
  }, []);

  const text =
    remaining === null
      ? '🕒 No time limit'
      : `🕒 Remaining Time: ${remaining} min`;

  return (
    <View style={styles.bar}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 6,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
