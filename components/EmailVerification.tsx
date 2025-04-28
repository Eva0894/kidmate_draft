import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { supabase } from '../utils/Supabase';

interface EmailVerificationProps {
  email: string;
  setEmail: (email: string) => void;
  onVerified: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ email, setEmail, onVerified }) => {
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Email is required');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setStep('verify');
      Alert.alert('Verification code sent', 'Check your email inbox.');
    } catch (err: any) {
      console.error('Send OTP error:', err);
      Alert.alert('Error sending code', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !email) {
      Alert.alert('Please enter both email and code');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;
      Alert.alert('Email verified successfully!');
      onVerified();
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      Alert.alert('Verification failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        editable={step === 'input'}
      />

      {step === 'verify' && (
        <>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter the code"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
        </>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={step === 'input' ? handleSendOtp : handleVerifyOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {step === 'input' ? 'Send Verification Code' : 'Verify Code'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EmailVerification;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'ChalkboardSE-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
  },
  buttonText: {
    color: 'green',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'ChalkboardSE-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
