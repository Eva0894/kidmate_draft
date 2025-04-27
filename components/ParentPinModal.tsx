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
}

export default function ParentPinModal({ visible, onClose }: ParentPinModalProps) {
  const [newPin, setNewPin] = useState('');
  const [hasPin, setHasPin] = useState(false);

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

  const handleSetPin = async () => {
    if (newPin.length !== 4 || !/^[0-9]{4}$/.test(newPin)) {
      Alert.alert('PIN Muset be 4 digits');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'Logged-in User Information Not Obtained.');
      return;
    }
    
    const { error } = await supabase
      .from('users')
      .update({ pin_code: newPin })
      .eq('user_id', user.id);


    if (error) {
      Alert.alert('Setting Failed', error.message);
    } else {
      Alert.alert('Setting Successfully');
      setHasPin(true);
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
            placeholder="Please enter 4-digit PIN"
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            style={styles.modalInput}
          />

          <TouchableOpacity style={styles.confirmButton} onPress={handleSetPin}>
            <Text style={styles.confirmButtonText}>Comfirm</Text>
          </TouchableOpacity>

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
  cancelButton: {
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 14,
  },
});