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
import { supabase } from '../../utils/Supabase';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import Modal from 'react-native-modal';
import { useEffect } from 'react';
import { post } from '@/utils/api';
import { getAuthBackendUrl } from '@/utils/apiConfig'; 

const backgroundImage = require('@/assets/images/login-bg.jpg');

const Login = () => {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    if (hcaptchaToken) {
      console.log('🚀 触发 handleLogin()');
      handleLogin();
      console.log('✅ hCaptcha token:', hcaptchaToken);
      console.log('✅ BASE_URL:', getAuthBackendUrl());
    }
  }, [hcaptchaToken]);

  const handleCaptchaMessage = (event: any) => {
    const token = event.nativeEvent.data;
    setHcaptchaToken(token);
    setShowCaptcha(false);
    console.log('✅ hCaptcha token:', token);
  };

  const handleLogin = async () => {
    if (!hcaptchaToken) {
      Alert.alert('Please pass the human-machine verification first');
      setShowCaptcha(true);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('🚀 触发 handleLogin()');
      console.log('✅ hCaptcha token:', hcaptchaToken);
    
      // Step 1️⃣: 后端验证 hCaptcha
      const result = await post('/api/login', {
        token: hcaptchaToken,
        email, 
      }, getAuthBackendUrl());
    
      if (!result.success) {
        Alert.alert('人机验证失败', result.message || '请重试');
        return;
      }
    
      // Step 2️⃣: Supabase 账号密码登录
      console.log('🟢 hCaptcha 成功，开始 Supabase 登录:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    
      if (error) {
        console.log('🔴 登录失败:', error.message);
        Alert.alert('Login failed', error.message);
        return;
      }
    
      const sessionUser = data.session?.user;
    
      if (!sessionUser) {
        Alert.alert('Login error', 'No session user found.');
        return;
      }
    
      Alert.alert('Login Successfully! ', 'Welcome back!');
      console.log('✅ 登录成功, user ID:', sessionUser.id);
      router.replace('/(tabs)/main');
    
    } catch (err) {
      console.error('❌ 登录流程出错:', err);
      const error = err as Error;
      Alert.alert('Network Error', error.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Tip', 'Please enter the email address you used when registering');
    }
    router.push('/reset-password');
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

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => setShowCaptcha(true)}  
            disabled={loading}
          >
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
            source={{ uri: 'https://hcaptcha-vercel.vercel.app/hcaptcha.html' }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            userAgent="Mozilla/5.0 (Linux; Android 10; Emulator) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.99 Mobile Safari/537.36"
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error: ', nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView HTTP error: ', nativeEvent);
            }}
            onLoadEnd={() => {
              console.log('WebView finished loading.');
            }}
            onLoad={() => {
              console.log('WebView started loading.');
            }}
            onLoadStart={() => {
              console.log('WebView load start.');
            }}
            onNavigationStateChange={(navState) => {
              console.log('WebView navigation state:', navState.url);
            }}
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