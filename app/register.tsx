import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  ImageBackground
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { supabase } from '../utils/Supabase';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState(new Date('2015-01-01'));
  const [showPicker, setShowPicker] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    try {
      // Step 1: 注册账户
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      // Step 2: 注册后立即登录
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        throw loginError;
      }

      // Step 3: 获取当前登录用户信息
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (userError || !userId) {
        throw new Error('登录成功但获取用户信息失败');
      }

      // Step 4: 写入 users 表
      const { error: insertError } = await supabase.from('users').upsert([
        {
          user_id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob.toISOString().split('T')[0],
          is_active: true,
          has_answered_questions: false,
        },
      ]);

      if (insertError) {
        Alert.alert('注册成功，但写入数据库失败', insertError.message);
      } 
      
      
      else {
        Alert.alert('Register Successflly! Jump to main page...');
        router.replace('/main'); 
      }
    } catch (err: any) {
      console.log('Supabase 注册错误:', err);
      Alert.alert('Register Failed', err.message || 'Please try again later');
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDob(selectedDate);
  };

  return (
    <ImageBackground
      source={require('@/assets/images/signup-bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
        {/* back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={32} color="#E5911B" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formWrapper}>
            <Text style={styles.title}>Create Account</Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text.toLowerCase())}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          <TextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />

          <TextInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
          />

          <Text style={styles.datePickerButton}>Birthday</Text>
          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
            <Text>{dob.toDateString()}</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
            <Text style={styles.submitText}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  formWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: '100%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
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
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  datePickerButton: {
    backgroundColor: '#ffe4e1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ff69b4',
    marginBottom: 16,
  },
  datePickerText: {
    color: '#d63384',
    fontSize: 16,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#ff69b4',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton:{
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});