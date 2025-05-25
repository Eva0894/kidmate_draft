// ParentPinModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { supabase } from '../utils/Supabase';

interface ParentPinModalProps {
  visible: boolean;
  onClose: () => void;
  isVerified: boolean; // 来自 App 的状态控制，是否通过邮箱验证
}

export default function ParentPinModal({ visible, onClose, isVerified }: ParentPinModalProps) {
  const [newPin, setNewPin] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkPin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('pin_code')
          .eq('user_id', user.id)
          .single();

        if (!error && data?.pin_code) {
          setHasPin(true);
        }
      }
    };

    if (visible) {
      checkPin();
    }
  }, [visible]);

  const requestVerification = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: { emailRedirectTo: 'kidmate://verify-pin' },
    });

    if (error) {
      Alert.alert('Verification failed', error.message);
    } else {
      Alert.alert('Verification email sent', 'Please check your email.');
    }
  };

  const handleSetPin = async () => {
    if (newPin.length !== 4 || !/^[0-9]{4}$/.test(newPin)) {
      Alert.alert('PIN must be 4 digits');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('User not logged in');
      return;
    }

    if (hasPin && !isVerified) {
      Alert.alert('Please verify your email first');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('users')
      .update({ pin_code: newPin })
      .eq('user_id', user.id);

    setLoading(false);

    if (error) {
      Alert.alert('Update failed', error.message);
    } else {
      Alert.alert('PIN updated successfully');
      setNewPin('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{hasPin ? 'Change Parent PIN' : 'Set Parent PIN'}</Text>

          <TextInput
            value={newPin}
            onChangeText={setNewPin}
            placeholder="Enter 4-digit PIN"
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            style={styles.modalInput}
          />

          <TouchableOpacity style={styles.confirmButton} onPress={handleSetPin} disabled={loading}>
            <Text style={styles.confirmButtonText}>{loading ? 'Updating...' : 'Confirm'}</Text>
          </TouchableOpacity>

          {hasPin && !isVerified && (
            <TouchableOpacity style={styles.verifyButton} onPress={requestVerification}>
              <Text style={styles.verifyButtonText}>Verify Email to Change PIN</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  verifyButtonText: {
    color: '#fff',
  },
  cancelButton: {
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 14,
  },
});