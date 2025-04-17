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
} from 'react-native';
import { supabase } from '../utils/Supabase';

const Login = () => {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  setLoading(true);
  try {
    console.log('正在尝试登录:', email);
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

    console.log('Login successfully, user ID:', sessionUser.id);
    console.log('Login successfully, user mailbox:', sessionUser.email);
    router.replace('/main');

  } catch (err: any) {
    Alert.alert('Login error', err.message || 'Please try again later');
  } finally {
    setLoading(false);
  }
};

  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={70}
      style={styles.container}>
      {loading && (
        <View style={defaultStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <TouchableOpacity onPress={() => router.back()} >
        <Text >Back</Text>
      </TouchableOpacity>

      <Image source={require('@/assets/images/logo-dark.png')} style={styles.logo} />

      <Text style={styles.title}>
        {type === 'login' ? 'Welcome back' : 'Sign in to continue'}
      </Text>

      <View style={{ marginBottom: 30 }}>
        <TextInput
          autoCapitalize="none"
          placeholder="john@apple.com"
          value={email}
          onChangeText={(text) => setEmail(text.toLowerCase())}
          style={styles.inputField}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.inputField}
        />
      </View>

      <TouchableOpacity style={[defaultStyles.btn, styles.btnPrimary]} onPress={handleLogin}>
        <Text style={styles.btnPrimaryText}>Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logo: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginVertical: 80,
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  inputField: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    marginVertical: 4,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Login;
