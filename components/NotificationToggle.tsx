import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Alert } from 'react-native';
// import * as Device from 'expo-device';
import { supabase } from '@/utils/Supabase';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export default function NotificationToggle() {
  const [enabled, setEnabled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const isExpoGo = Constants.appOwnership === 'expo';

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from('users')
          .select('expo_push_token')
          .eq('id', user.id)
          .single();
        setEnabled(!!data?.expo_push_token);
      }
    };
    fetchUser();
  }, []);

  const toggleNotifications = async () => {
    if (!userId) {
      Alert.alert('User not signed in');
      return;
    }

    if (isExpoGo) {
      Alert.alert('⚠️ Push not supported in Expo Go');
      return;
    }

    // ✅ 动态导入，避免在 Expo Go 中崩溃
    const Notifications = require('expo-notifications');

    if (enabled) {
      const { error } = await supabase
        .from('users')
        .update({ expo_push_token: null })
        .eq('id', userId);
      if (!error) {
        setEnabled(false);
        Alert.alert('🔕 Notifications turned off');
      }
    } else {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      const finalStatus =
        existingStatus === 'granted'
          ? existingStatus
          : (await Notifications.requestPermissionsAsync()).status;

      if (finalStatus !== 'granted') {
        Alert.alert('Permission denied', 'Please enable notifications in settings.');
        return;
      }

      if (!Device.isDevice) {
        Alert.alert('Physical device required', 'Push notifications only work on real devices.');
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      const { error } = await supabase
        .from('users')
        .update({ expo_push_token: token })
        .eq('id', userId);

      if (!error) {
        setEnabled(true);
        Alert.alert('🔔 Notifications enabled!');
      } else {
        Alert.alert('Failed to save token', error.message);
      }
    }
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
      <Text style={{ fontSize: 18, color: '#E5911B', fontWeight: '600',fontFamily: Platform.select({
            ios: 'ChalkboardSE-Regular',
            android: 'monospace',}), }}>Enable Push Notifications</Text>
      <Switch value={enabled} onValueChange={toggleNotifications} />
    </View>
  );
}