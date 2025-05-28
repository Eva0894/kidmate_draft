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
  ImageBackground,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/Supabase';
import Modal from 'react-native-modal';


export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState(new Date('2015-01-01'));
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(true);


  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://kidmate-resetpw.vercel.app/signup-confirmed.html',
        },
      });
  
      if (error) throw error;

          // ✅ 插入用户资料到 users 表
    if (data.user) {
      const insertRes = await supabase.from('users').insert({
        user_id: data.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dob.toISOString(),
      });

      if (insertRes.error) {
        console.warn('⚠️ 插入用户资料失败:', insertRes.error.message);
      }
    }

      // 注册成功后，跳到 confirm-email 页面，传递注册信息
      router.push({
        pathname: '/confirm-email',
        params: {
          email,
          password,
          firstName,
          lastName,
          dob: dob.toISOString(), 
        },
      });

    } catch (err: any) {
      console.error('Registration error:', err);
      Alert.alert('Registration failed', err.message);
    } finally {
      setLoading(false);
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

          <View style={{ position: 'relative' }}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={{ position: 'absolute', right: 16, top: 12 }}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry={!showPassword}
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

          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? 'Registering...' : 'Register'}
            </Text>
          </TouchableOpacity>
          <Modal isVisible={showPolicyModal} backdropOpacity={0.7} animationIn="fadeInUp" animationOut="fadeOutDown">
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Privacy & Terms</Text>
              <Text style={styles.modalMessage}>
                Please review and accept our Privacy Policy & Terms of Service to continue using the app.
              </Text>

              {/* View Full Policy Link */}
              <TouchableOpacity onPress={() => router.push('/privacy')}>
                <Text style={styles.policyLinkText}>View Full Policy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.agreeButton} onPress={() => setShowPolicyModal(false)}>
                <Text style={styles.agreeButtonText}>Agree and Continue</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.disagreeButton} onPress={() => router.replace('/')}>
                <Text style={styles.disagreeButtonText}>Disagree and Exit</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
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
    fontFamily: 'ChalkboardSE-Regular',
  },
  datePickerButton: {
    backgroundColor: '#ffe4e1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ff69b4',
    marginBottom: 16,
    fontFamily: 'ChalkboardSE-Regular',
    fontSize: 16,
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
    fontFamily: 'ChalkboardSE-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  agreeButton: {
    backgroundColor: '#E5911B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
    marginBottom: 12,
  },
  agreeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  disagreeButton: {
    borderColor: '#E5911B',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
  },
  disagreeButtonText: {
    color: '#E5911B',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  policyLinkText: {
    color: '#E5911B',
    textDecorationLine: 'underline',
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});