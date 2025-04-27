
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  Platform,
  ImageBackground,
} from 'react-native';
import { supabase } from '../utils/Supabase';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import Modal from 'react-native-modal';
import { useEffect } from 'react';

const backgroundImage = require('@/assets/images/login-bg.jpg');

const Login = () => {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    if (recaptchaToken) {
      console.log('🚀 触发 handleLogin()');
      handleLogin();
    }
  }, [recaptchaToken]);
  
  const handleCaptchaMessage = (event: any) => {
    const token = event.nativeEvent.data;
    console.log('✅ reCAPTCHA token:', token);
    setRecaptchaToken(token);
    setShowCaptcha(false);
  };

  const handleLogin = async () => {
    if (!recaptchaToken) {
      Alert.alert('Please pass the human-machine verification first');
      setShowCaptcha(true);
      return;
    }

    setLoading(true);
    try {
      console.log('📤 发送 reCAPTCHA token 给后端...');
      const res = await fetch('http://192.168.0.249:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          token: recaptchaToken, 
        }),
      });
      console.log('🔗 正在发送验证请求到后端');

      // Supabase login
      console.log('trying to login:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.log('login failed:', error.message);
        Alert.alert('Login failed', error.message);
        return;
      }
      const sessionUser = data.session?.user;
      if (!sessionUser) {
        Alert.alert('Login error', 'No session user found.');
        return;
      }
      console.log('📬 收到后端响应，解析中...');
      const result = await res.json();
      console.log('📦 后端返回结果:', result);
      if (result.success) {
        Alert.alert('Login Successfully! ', 'Welcome back!');
        console.log('Login successfully, user ID:', sessionUser.id);
        console.log('Login successfully, user mailbox:', sessionUser.email);
        console.log('jumping to main');
        router.replace('/(tabs)/main');
      } else {
        Alert.alert('Login Failed', result.message || 'Please check the verification code or account password');
      }

    } catch (err) {
      const error = err as Error;
      Alert.alert('Network Error', error.message);
    }
  };
  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Please contact support for password recovery.');
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
        <TouchableOpacity onPress={() => router.back()} >
          <Ionicons name="arrow-back" size={32} color="#E5911B" marginTop={40}/>
        </TouchableOpacity>
        <Image source={require('@/assets/images/logo-login.jpg')} style={styles.logo} />   
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>     
        <View style={styles.form}>
          <Text style={styles.title}>Welcome Back</Text>
          <TextInput
            placeholder="john@apple.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={{ color: Colors.primary, marginTop: 10, fontFamily: 'ChalkboardSE-Regular' }}>Forgot Password?</Text>
        </TouchableOpacity>


        <Modal isVisible={showCaptcha}>
          <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden' }}>
            <WebView
              source={{ uri: 'https://kidmate-recaptcha-nmiht0pkh-evas-projects-d1ccc46f.vercel.app' }}
              onMessage={handleCaptchaMessage}
            />
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    marginBottom: 200,
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
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
  loginButton: {
    backgroundColor: 'goldenrod',
    marginVertical: 4,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'ChalkboardSE-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    fontWeight: 'bold',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 20,
  },
});

export default Login;
