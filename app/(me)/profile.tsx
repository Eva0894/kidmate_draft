import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  Appearance,
  ImageBackground,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { supabase } from '@/utils/Supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeContext';
import { useT } from '@/utils/useT';
import meStyles from './meStyles';


export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [editable, setEditable] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');

  const t = (key: string) => {
    const dict: any = {
      username: { en: 'Nick Name', zh: 'Username' },
      first_name: { en: 'First Name', zh: 'First Name' },
      last_name: { en: 'Last Name', zh: 'Last Name' },
      email: { en: 'Email / Phone', zh: 'Email / Phone' },
      password: { en: 'Password', zh: 'Password' },
      birthday: { en: 'Birthday', zh: 'Birthday' },
      save: { en: 'Save', zh: 'Save' },
      edit: { en: 'Edit', zh: 'Edit' },
    };
    return dict[key]?.[language] || key;
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        Alert.alert('❌ Unable to retrieve user session');
        return;
      }
      setUserId(session.user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      Alert.alert('Failed to read user profile', error.message);
    } else {
      setUserName(data.username || '');
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setEmail(data.email || '');
      setDateOfBirth(data.date_of_birth ? new Date(data.date_of_birth) : null);
    }
  };

  const updateProfile = async () => {
    const updates = {
      username: userName,
      first_name: firstName,
      last_name: lastName,
      email,
      date_of_birth: dateOfBirth?.toISOString() ?? null,
    };

    const { error } = await supabase.from('users').update(updates).eq('user_id', userId);

    if (error) {
      Alert.alert('Save Failed', error.message);
    } else {
      Alert.alert('✅ Saved Successfully');
      setEditable(false);
    }
  };

  return (
      <ScrollView style={{ flex: 1, backgroundColor: isDarkMode ? '#1e1e1e' : '#fff9ef', padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.push('/me')}>
            <Ionicons name="arrow-back" size={32} color="#E5911B" />
          </TouchableOpacity>
          <Text style={meStyles.header}>Profile</Text>
          <TouchableOpacity onPress={() => setEditable(true)}>
            <Ionicons name="create-outline" size={24} color="#cc8400" />
          </TouchableOpacity>
        </View>

        <LabelInput label={t('username')} value={userName} onChangeText={setUserName} editable={editable} dark={isDarkMode} />
        <LabelInput label={t('first_name')} value={firstName} onChangeText={setFirstName} editable={editable} dark={isDarkMode} />
        <LabelInput label={t('last_name')} value={lastName} onChangeText={setLastName} editable={editable} dark={isDarkMode} />
        <LabelInput label={t('email')} value={email} onChangeText={setEmail} editable={editable} dark={isDarkMode} />

        <Text style={{ fontWeight: 'bold', marginTop: 16, color: isDarkMode ? '#fff' : '#222', fontFamily: 'ChalkboardSE-Regular',
          fontSize: 16, }}>{t('birthday')}</Text>
        <TouchableOpacity
          onPress={() => editable && setShowDatePicker(true)}
          style={{
            backgroundColor: '#fff',
            borderColor: '#ddd',
            borderWidth: 1,
            padding: 10,
            borderRadius: 8,
            marginTop: 8,
          }}
        >
          <Text>{dateOfBirth ? dateOfBirth.toDateString() : 'Tap to select date'}</Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          date={dateOfBirth || new Date()}
          onConfirm={(date) => {
            setDateOfBirth(date);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
          maximumDate={new Date()}
        />

        {editable && (
          <TouchableOpacity
            onPress={updateProfile}
            style={{
              backgroundColor: '#f2c66d',
              padding: 14,
              marginTop: 24,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('save')}</Text>
          </TouchableOpacity>
        )}

        <View style={{ marginTop: 40, }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8, color: isDarkMode ? '#fff' : '#222', fontFamily: 'ChalkboardSE-Regular',
          fontSize: 16 }}>Language</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity onPress={() => setLanguage('en')} style={{ marginRight: 16 }}>
              <Text style={{ color: language === 'en' ? '#cc8400' : '#999',fontFamily: 'ChalkboardSE-Regular',
          fontSize: 14}}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLanguage('zh')}>
              <Text style={{ color: language === 'zh' ? '#cc8400' : '#999',fontFamily: 'ChalkboardSE-Regular',
          fontSize: 14 }}>Chinese</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', color: isDarkMode ? '#fff' : '#222', fontFamily: 'ChalkboardSE-Regular',
          fontSize: 18 }}>Dark Mode</Text>
            <Switch value={isDarkMode} onValueChange={() => setIsDarkMode(!isDarkMode)} />
          </View>
        </View>
      </ScrollView>
  );
}

function LabelInput({
  label,
  value,
  onChangeText,
  editable,
  secureTextEntry = false,
  dark,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  secureTextEntry?: boolean;
  dark: boolean;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontWeight: 'bold', color: dark ? '#fff' : '#333', fontFamily: 'ChalkboardSE-Regular',
          fontSize: 16, }}>{label}</Text>
      <TextInput
        value={value}
        editable={editable}
        secureTextEntry={secureTextEntry}
        onChangeText={onChangeText}
        style={{
          backgroundColor: dark ? '#2a2a2a' : '#fff',
          borderColor: '#ddd',
          borderWidth: 1,
          padding: 10,
          marginTop: 8,
          borderRadius: 8,
          color: dark ? '#fff' : '#000',
          fontFamily: 'ChalkboardSE-Regular',
          fontSize: 18,
        }}
      />
    </View>
  );
}