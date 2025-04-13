import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
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
  const [role, setRole] = useState<'parent' | 'child'>('parent');
  const [showPicker, setShowPicker] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    try {
      // ✅ Step 1: 注册账户
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      // ✅ Step 2: 注册后立即登录
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        throw loginError;
      }

      // ✅ Step 3: 获取当前登录用户信息
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (userError || !userId) {
        throw new Error('登录成功但获取用户信息失败');
      }

      // ✅ Step 4: 写入 users 表
      const { error: insertError } = await supabase.from('users').upsert([
        {
          user_id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob.toISOString().split('T')[0],
          role: role === 'parent' ? 1 : 0,
          is_active: true,
        },
      ]);

      if (insertError) {
        Alert.alert('注册成功，但写入数据库失败', insertError.message);
      } else {
        Alert.alert('注册成功！');
        router.replace('/'); 
      }
    } catch (err: any) {
      console.log('Supabase 注册错误:', err);
      Alert.alert('注册失败', err.message || '请重试');
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDob(selectedDate);
  };

  return (
    <View style={styles.container}>
      {/* back */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
        <Text style={styles.backText}></Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create your account</Text>

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

      <Text style={styles.label}>Role</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={role} onValueChange={(itemValue) => setRole(itemValue)}>
          <Picker.Item label="Parent" value="parent" />
          <Picker.Item label="Child" value="child" />
        </Picker>
      </View>

      <Text style={styles.label}>Birthday</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.selectButton}>
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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

// 样式保持一致
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfaf2',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 14,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: 'bold',
    color: '#444',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 14,
  },
  selectButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#e2ac30',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
});
