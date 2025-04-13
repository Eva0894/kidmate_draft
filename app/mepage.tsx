import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../components/ThemeContext';
import { supabase } from '../utils/Supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import ParentPinModal from '../components/ParentPinModal';

export default function MePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [inputPin, setInputPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      } else {
        Alert.alert('❌ 无法获取用户 Session');
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    const fetchAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('fail to get avatar:', error.message);
      } else {
        setAvatarUrl(data?.avatar_url || null);
      }
    };

    fetchAvatar();
  }, []);

  const uploadAvatar = async () => {
    const userResponse = await supabase.auth.getUser();
    const user = userResponse.data.user;
    if (!user) {
      Alert.alert('未登录，无法上传头像');
      return;
    }
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('需要访问相册权限');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      const image = result.assets[0];
      const fileExt = image.uri.split('.').pop() || 'jpg';
      const filePath = `${user.id}/${uuidv4()}.${fileExt}`;
      const response = await fetch(image.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          upsert: true,
          contentType: blob.type,
        });

      if (uploadError) {
        console.error('上传失败:', uploadError.message);
        Alert.alert('上传失败，请重试');
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('更新头像失败:', updateError.message);
        Alert.alert('头像链接保存失败');
      } else {
        setAvatarUrl(publicUrl);
        Alert.alert('✅ 头像上传成功！');
      }
    }
  };

  const settings = [
    { title: 'Profile', path: '/(me)/profile' },
    { title: 'Language', path: '/(me)/language' },
    { title: 'Eye Protection Mode', path: '/(me)/eye-protect' },
    { title: 'Notifications', path: '/(me)/notification' },
    { title: 'Security', path: '/(me)/security' },
    { title: 'Set Parent Pin', path: '', onPress: () => setShowPinModal(true)},
    { title: 'Parent Mode', path: '', onPress: () => !isLocked && setShowPinInput(true) },
    { title: 'Account Management', path: '/(me)/account-management' },
    { title: 'About Us', path: '/(me)/about' },
    { title: 'Contact Us', path: '/(me)/contact' },
  ];

  const privacy = [
    { title: 'Privacy policy', path: '/(me)/privacy' },
    { title: 'Information collection list', path: '/(me)/info-list' },
    { title: 'Help & Feedback', path: '/(me)/help' },
    { title: 'About', path: '/(me)/about' },
    { title: 'Terms of Service', path: '/(me)/terms' },
    { title: 'User Agreement', path: '/(me)/user-agreement' },
    { title: 'Privacy Settings', path: '/(me)/privacy-settings' },
  ];

  const renderItem = (item: { title: string; path?: string; onPress?: () => void }, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.item}
      onPress={() => {
        if (item.onPress) {
          item.onPress();
        } else if (item.path) {
          router.push(item.path as any);
        }
      }}
    >
      <Text style={styles.itemText}>{item.title}</Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const enableParentMode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('users')
      .select('parent_pin')
      .eq('user_id', user.id)
      .single();

    if (error) {
      Alert.alert('error', 'Unable to retrieve PIN information');
      return;
    }

    if (inputPin === data?.parent_pin) {
      await supabase
        .from('users')
        .update({ is_parent_mode: true })
        .eq('user_id', user.id);

      setShowPinInput(false);
      setInputPin('');
      setPinAttempts(0);
      router.push('/parent-main-page');
    } else {
      const attempts = pinAttempts + 1;
      setPinAttempts(attempts);
      if (attempts >= 3) {
        setIsLocked(true);
        Alert.alert('Locked', 'PIN entered incorrectly more than 3 times, please try again later');
      } else {
        Alert.alert('error', `PIN incorrect, you still have ${3 - attempts} chances`);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={uploadAvatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>{settings.map(renderItem)}</View>

      <Text style={styles.privacyTitle}>Privacy</Text>
      <View style={styles.section}>{privacy.map(renderItem)}</View>

      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
        <Text style={styles.themeText}>
          Dark Mode: {theme === 'dark' ? 'On' : 'Off'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutToggle}
        onPress={async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert('Logout failed', error.message);
          } else {
            router.replace('/');
          }
        }}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Modal visible={showPinInput} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', margin: 30, borderRadius: 10, padding: 20 }}>
            <Text style={{ marginBottom: 10, fontSize: 16, fontWeight: '500' }}>Please Enter Parent PIN:</Text>
            <TextInput
              placeholder="4 digits"
              secureTextEntry
              keyboardType="number-pad"
              value={inputPin}
              onChangeText={setInputPin}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 }}
            />
            <TouchableOpacity
              style={{ backgroundColor: '#D4A017', padding: 10, borderRadius: 8, alignItems: 'center' }}
              onPress={enableParentMode}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Confirm to Enter Parent Mode</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowPinInput(false)}
              style={{ marginTop: 10, padding: 10, alignItems: 'center' }}
            >
              <Text style={{ color: '#888' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ParentPinModal visible={showPinModal} onClose={() => setShowPinModal(false)} />
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDF8EC',
    flex: 1,
  },
  header: {
    backgroundColor: '#FDF1D6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
    backgroundColor: '#ccc',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 50,
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderColor: '#F2E7C7',
  },
  itemText: {
    fontSize: 16,
    color: '#222',
  },
  arrow: {
    fontSize: 18,
    color: '#D4A017',
  },
  privacyTitle: {
    backgroundColor: '#FCF2D9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  logoutToggle: {
    marginVertical: 30,
    marginHorizontal: 50,
    paddingVertical: 14,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  themeToggle: {
    marginVertical: 30,
    marginHorizontal: 50,
    alignItems: 'center',
  },
  themeText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
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