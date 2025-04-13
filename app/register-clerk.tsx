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
import { useSignUp, useSignIn, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../utils/Supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState(new Date('2015-01-01'));
  const [role, setRole] = useState<'parent' | 'child'>('parent');
  const [showPicker, setShowPicker] = useState(false);

  const { signUp } = useSignUp();
  const { signIn, setActive } = useSignIn();
  const { userId } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    try {
      if (!signUp || !signIn) {
        Alert.alert('Clerk 未加载，请稍后再试');
        return;
      }

      // Step 1: 注册账号
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Step 2: 登录（不能依赖 signUp 返回 session）
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (!result.createdSessionId) {
        throw new Error('登录失败，未返回 Session ID');
      }

      // Step 3: 激活 session
      await setActive({ session: result.createdSessionId });

      // Step 4: 写入 Supabase
      const { error } = await supabase.from('users').upsert([
        {
          user_id_text: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob.toISOString().split('T')[0],
          role: role === 'parent' ? 1 : 0,
          is_active: true,
        },
      ]);

      if (error) {
        Alert.alert('注册成功，但写入数据库失败', error.message);
      } else {
        Alert.alert('注册成功！');
        router.replace('/chat'); // 替换为你想跳转的页面
      }
    } catch (err: any) {
      console.log('❌ 注册错误:', err);
      Alert.alert('注册失败', err.errors?.[0]?.message || err.message);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDob(selectedDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
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

// ✅ 样式
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
});
