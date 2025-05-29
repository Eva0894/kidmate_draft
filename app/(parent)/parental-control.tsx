import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/Supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API = 'http://13.236.67.206:8000/api/parental-control';

export default function ParentalControlPage() {
  const [minutes, setMinutes] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error: sessionErr,
      } = await supabase.auth.getUser();
      if (sessionErr || !user?.id) {
        Alert.alert('Error', 'Please log in first.');
        return;
      }
      setUserId(user.id);

      try {
        const res = await fetch(`${API}/users/${user.id}/usage-status`);
        if (res.ok) {
          const { remaining_seconds, used_seconds } = await res.json();
          if (remaining_seconds !== null) {
            const totalSec = remaining_seconds + used_seconds;
            setMinutes(String(Math.ceil(totalSec / 60)));
          }
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    const m = parseInt(minutes, 10);
    if (isNaN(m) || m < 0) {
      Alert.alert('Error', 'Please enter a valid number of minutes');
      return;
    }

    try {
      const res = await fetch(`${API}/usage-limits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          duration_seconds: m * 60,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }

      await AsyncStorage.removeItem('appUnlocked');

      Alert.alert('✅ Success', 'Time limit set');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to set time limit');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button (unified style) */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#E5911B" />
      </TouchableOpacity>

      <Text style={styles.title}>🕒 Parental Control</Text>
      <Text style={styles.label}>Set usage duration (minutes):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter minutes"
        keyboardType="number-pad"
        value={minutes}
        onChangeText={setMinutes}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6E3',
    padding: 24,
    justifyContent: 'flex-start',
  },
  backButton: {
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#E5911B',
    textAlign:'center',
    fontFamily: Platform.select({
          ios: 'ChalkboardSE-Regular',
          android: 'monospace',
        }),
  },
  label: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',
    }),
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 18,
    marginBottom: 20,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',
    }),
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',
    }),
  },
});
