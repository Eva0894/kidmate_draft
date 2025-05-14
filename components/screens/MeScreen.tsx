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
  Appearance,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeContext';
import { supabase } from '@/utils/Supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import ParentPinModal from '@/components/ParentPinModal';
import { useT } from '@/utils/useT';
import AvatarUploader from '@/components/AvatarUploader';
import { ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { Platform } from 'react-native';


export default function MeSreen() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [inputPin, setInputPin] = useState('');
    const [showPinInput, setShowPinInput] = useState(false);
    const [pinAttempts, setPinAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const t = useT();
    const [modalVisible, setModalVisible] = useState(false);
    // const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');

    const [userId, setUserId] = useState<string | null>(null);
    useEffect(() => {
        const getUserId = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setUserId(session.user.id);
        } else {
            Alert.alert('Unable to Obtain User Session');
        }
        };
        getUserId();
    }, []);


  const settings = [
    { title: 'Profile', path: '/(me)/profile' },
    { title: 'Personalization', path: '/(me)/personalization' },
    { title: 'Language', path: '/(me)/language' },
    { title: 'Notifications', path: '/(me)/notification' },
    // { title: 'Security', path: '/(me)/security' },
    { title: 'Set Parent Pin', path: '', onPress: () => setShowPinModal(true)},
    { title: 'Parent Mode', path: '', onPress: () => !isLocked && setShowPinInput(true) },
  ];

  const privacy = [
    { title: 'About', path: '/(me)/about' },
    { title: 'Help & Feedback', path: '/(me)/help' },
    { title: 'Privacy Policy', path: '/(me)/privacy' },
    { title: 'Terms of Service', path: '/(me)/terms' },
    { title: 'Information Collection', path: '/(me)/info-list' },
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
      .select('pin_code')
      .eq('user_id', user.id)
      .single();

    console.log('Supabase query results:', { data, error });
    if (error || !data) {
      Alert.alert('error', 'Unable to retrieve PIN information');
      return;
    }

    if (inputPin === data?.pin_code) {
      await supabase
        .from('users')
        .update({ is_parent_mode: true })
        .eq('user_id', user.id);

      setShowPinInput(false);
      setInputPin('');
      setPinAttempts(0);
      router.push('/(parent)/parent-main-page');
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
      <View style={styles.avatarSection}>
        <AvatarUploader />
      </View>

      <View style={styles.section}>{settings.map(renderItem)}</View>

      <Text style={styles.privacyTitle}>Privacy</Text>
      <View style={styles.section}>{privacy.map(renderItem)}</View>

      {/* <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
        <Text style={styles.themeText}>
          Dark Mode: {theme === 'dark' ? 'On' : 'Off'}
        </Text>
      </TouchableOpacity> */}

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
            <Text style={{ marginBottom: 10, fontSize: 18, fontWeight: '500' ,fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),}}>Please Enter Parent PIN:</Text>
            <TextInput
              placeholder="4 digits"
              secureTextEntry
              keyboardType="number-pad"
              value={inputPin}
              onChangeText={setInputPin}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 ,fontFamily: Platform.select({
                ios: 'ChalkboardSE-Regular',
                android: 'monospace',}),}}
            />
            <TouchableOpacity
              style={{ backgroundColor: '#E5911B', padding: 10, borderRadius: 8, alignItems: 'center' }}
              onPress={enableParentMode}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}), fontSize: 16}}>Confirm to Enter Parent Mode</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowPinInput(false)}
              style={{ marginTop: 10, padding: 10, alignItems: 'center' }}
            >
              <Text style={{ color: '#999',fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}), fontSize:16 }}>Cancel</Text>
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
    fontSize: 18,
    color: '#222',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
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
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
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
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
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
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
    backgroundColor: '#ccc',
    marginTop: 30,
  },
  avatarSection: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
});