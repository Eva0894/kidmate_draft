import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
} from 'react-native';
import { supabase } from '@/utils/Supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const backgroundImage = require('@/assets/images/login-bg.jpg');

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendResetEmail = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
  
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'exp://192.168.0.249:8081/reset-password', // 暂时
    });
    setLoading(false);
  
    if (error) {
      if (error.message.includes('User not found')) {
        Alert.alert('Invalid Email', 'The email address is not registered. Please enter a valid email.');
      } else {
        console.error('Unexpected error:', error.message);
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
      return;
    }
  
    Alert.alert('Success', '📩 Password reset link sent. Please check your email.');
    router.replace('/(auth)/login');
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 40, marginLeft: 10 }}>
        <Ionicons name="arrow-back" size={32} color="#E5911B" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <Image source={require('@/assets/images/logo-login.jpg')} style={styles.logo} />
        <View style={styles.form}>
          <Text style={styles.title}>Forgot Password</Text>
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSendResetEmail}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    marginBottom: 200,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 20,
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 44,
    fontFamily: 'ChalkboardSE-Regular',
    color: '#444',
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5911B',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
    fontFamily: 'ChalkboardSE-Regular',
    fontSize: 16,
  },
  button: {
    backgroundColor: 'goldenrod',
    marginVertical: 4,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'ChalkboardSE-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});