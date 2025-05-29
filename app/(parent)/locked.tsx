// app/(parent)/locked.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/Supabase';

export default function LockedPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [stored, setStored] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // 已解锁直接跳走
      if ((await AsyncStorage.getItem('appUnlocked')) === 'true') {
        router.replace('/main');
        return;
      }

      const { data: { user }, error: uErr } = await supabase.auth.getUser();
      if (uErr || !user?.id) {
        Alert.alert('Error', 'Not logged in');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('pin_code')
        .eq('user_id', user.id)
        .single();

      if (error || !data?.pin_code) {
        Alert.alert('Error', 'PIN not set');
      } else {
        setStored(data.pin_code);
      }
    })();
  }, [router]);

  const unlock = async () => {
    if (pin === stored) {
      await AsyncStorage.setItem('appUnlocked', 'true');
      router.replace('/main');
    } else {
      Alert.alert('Incorrect PIN');
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>🔒 App Locked</Text>
      <Text style={s.sub}>Enter PIN to unlock</Text>
      <TextInput
        style={s.input}
        value={pin}
        onChangeText={setPin}
        placeholder="4‑digit PIN"
        maxLength={4}
        secureTextEntry
        keyboardType="number-pad"
      />
      <TouchableOpacity style={s.btn} onPress={unlock}>
        <Text style={s.btnText}>Unlock</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FEF8E1', padding: 24,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#D84315' },
  sub: { fontSize: 16, marginTop: 8, marginBottom: 20, color: '#555' },
  input: {
    width: '60%', padding: 12, borderWidth: 1, borderColor: '#ccc',
    borderRadius: 8, backgroundColor: '#fff', fontSize: 18,
  },
  btn: {
    marginTop: 24, backgroundColor: '#FFD700',
    paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 8,
  },
  btnText: { fontSize: 16, fontWeight: '600', color: '#333' },
});

