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

  useEffect(() => {
    const handleDeepLink = async () => {
      const url = await Linking.getInitialURL();
      if (!url) return;

      const parsed = Linking.parse(url);
      const access_token = parsed.queryParams?.access_token as string;
      const refresh_token = parsed.queryParams?.refresh_token as string;
      const type = parsed.queryParams?.type;

      if (type === 'recovery' && access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          Alert.alert('Error', `Session restoration failed: ${error.message}`);
        } else {
          console.log('✅ Session restored:', data);
          setReadyToReset(true);
        }
      }

      setLoading(false);
    };

    handleDeepLink();
  }, []);
  useEffect(() => {
    const checkURL = async () => {
      const url = await Linking.getInitialURL();
      console.log('📫 Deep Link URL:', url);
      const parsed = Linking.parse(url || '');
      console.log('🔍 Parsed:', parsed);
    };
    checkURL();
  }, []);

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
      </View>
    );
  }

  if (!readyToReset) {
    return (
      <View style={styles.centered}>
        <Text style={{ textAlign: 'center', color: '#555' }}>
          Invalid or expired recovery link.
        </Text>
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