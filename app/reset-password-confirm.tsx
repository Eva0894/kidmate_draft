import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '@/utils/Supabase';
import { useRouter } from 'expo-router';

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [readyToReset, setReadyToReset] = useState(false);
  const [latestURL, setLatestURL] = useState<string | null>(null);

  useEffect(() => {
    const handleInitial = async () => {
      const url = await Linking.getInitialURL();
      console.log('🔍 Initial URL:', url);
      if (url) {
        handleLink(url);
      } else {
        setLoading(false);
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('🔁 Received deep link (runtime):', url);
      handleLink(url);
    });

    handleInitial();

    return () => {
      subscription.remove?.();
    };
  }, []);

  const handleLink = async (url: string) => {
    try {
      setLatestURL(url);
      const parsed = Linking.parse(url);
      console.log('📦 Parsed query params:', parsed.queryParams);

      const access_token = parsed.queryParams?.access_token as string;
      const refresh_token = parsed.queryParams?.refresh_token as string;
      const type = parsed.queryParams?.type;

      if (type === 'recovery' && access_token && refresh_token) {
        console.log('🔑 Setting session with tokens...');
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error('❌ Session set failed:', error.message);
          Alert.alert('Session Error', error.message);
          setReadyToReset(false);
        } else {
          console.log('✅ Session restored');
          setReadyToReset(true);
        }
      } else {
        console.warn('⚠️ Invalid deep link or missing token');
        setReadyToReset(false);
      }
    } catch (err) {
      console.error('💥 Deep link handling error:', err);
      setReadyToReset(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Please enter and confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Your password has been updated.');
      router.replace('/(auth)/login');
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E5911B" />
        <Text style={{ marginTop: 10 }}>Preparing...</Text>
        {latestURL && (
          <Text style={{ fontSize: 12, color: '#aaa', marginTop: 8 }} numberOfLines={2}>
            Latest URL: {latestURL}
          </Text>
        )}
      </View>
    );
  }

  if (!readyToReset) {
    return (
      <View style={styles.centered}>
        <Text style={{ textAlign: 'center', color: '#555' }}>
          Invalid or expired recovery link.
        </Text>
        {latestURL && (
          <Text style={{ fontSize: 12, color: '#aaa', marginTop: 8 }} numberOfLines={2}>
            Link tried: {latestURL}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>
      <TextInput
        placeholder="New Password"
        secureTextEntry
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        placeholder="Confirm New Password"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handlePasswordUpdate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Updating...' : 'Update Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#E5911B',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: Platform.select({ ios: 'ChalkboardSE-Regular', android: 'monospace' }),
  },
  button: {
    backgroundColor: '#E5911B',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: Platform.select({ ios: 'ChalkboardSE-Regular', android: 'monospace' }),
  },
});