import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../utils/Supabase';
import { useRouter } from 'expo-router';
import meStyles from './meStyles';
import { Platform } from 'react-native';

const INTEREST_OPTIONS = ['Story', 'Science', 'Plant', 'Animal', 'Art', 'Sport'];
const ACTIVITY_OPTIONS = [
  'Playing Piano',
  'Drawing',
  'Listening Songs',
  'Gaming',
  'Reading',
  'Watching Cartoons',
  'Taking Courses',
];

export default function PersonalizationPage() {
  const [editing, setEditing] = useState(false);
  const [favoriteActivity, setFavoriteActivity] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      setUserId(uid ?? null);
      if (!uid) return;

      const { data, error } = await supabase
        .from('personalization')
        .select('interest, favorite_activity')
        .eq('user_id', uid)
        .single();

      if (!error && data) {
        setFavoriteActivity(data.favorite_activity ?? '');
        setSelectedInterests(data.interest ?? []);
      }
    };
    loadData();
  }, []);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const savePreferences = async () => {
    if (!userId) return;

    const { data: userProfile, error: fetchError } = await supabase
      .from('users')
      .select('date_of_birth')
      .eq('user_id', userId)
      .single();

    if (fetchError || !userProfile?.date_of_birth) {
      Alert.alert('Error', '无法获取出生日期');
      return;
    }

    const dob = new Date(userProfile.date_of_birth);
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear() - (
      now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0
    );

    const { data: existingRow, error: fetchPersonalError } = await supabase
      .from('personalization')
      .select('id')
      .eq('user_id', userId)
      .single();

    let saveError = null;

    if (existingRow) {
      const { error } = await supabase
        .from('personalization')
        .update({
          age,
          interest: selectedInterests,
          favorite_activity: favoriteActivity,
        })
        .eq('user_id', userId);
      saveError = error;
    } else {
      const { error } = await supabase
        .from('personalization')
        .insert({
          user_id: userId,
          age,
          interest: selectedInterests,
          favorite_activity: favoriteActivity,
        });
      saveError = error;
    }

    if (!saveError) {
      Alert.alert('Saved', 'Your personalization has been updated!');
      setEditing(false);
    } else {
      Alert.alert('Error', 'Failed to save personalization.');
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/prefer-bg.jpg')}
      style={{ flex: 1 }}
      resizeMode='cover'
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', left: 0 }}>
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>

          {/* Title */}
          <Text style={{
            fontSize: 24,
            fontWeight: '600',
            color: '#E5911B',
            fontFamily: Platform.select({
                  ios: 'ChalkboardSE-Regular',
                  android: 'monospace',}),
            textAlign: 'center',
          }}>
            Personalization
          </Text>

          {/* edit button */}
          <TouchableOpacity onPress={() => setEditing(!editing)} style={{ position: 'absolute', right: 0 }}>
            <Ionicons name={editing ? 'checkmark' : 'create-outline'} size={32} color="#E5911B" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Favorite Activity</Text>
        <View style={styles.interestsContainer}>
          {ACTIVITY_OPTIONS.map(option => {
            const selected = favoriteActivity === option;
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.interestButton,
                  selected && styles.interestSelected
                ]}
                onPress={() => editing && setFavoriteActivity(option)}
              >
                <Text
                  style={[
                    styles.interestText,
                    selected && styles.interestTextSelected,
                    { fontFamily: Platform.select({
                      ios: 'ChalkboardSE-Regular',
                      android: 'monospace',}), }
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Interests</Text>
        <View style={styles.interestsContainer}>
          {INTEREST_OPTIONS.map(option => {
            const selected = selectedInterests.includes(option);
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.interestButton,
                  selected && styles.interestSelected
                ]}
                onPress={() => editing && toggleInterest(option)}
              >
                <Text
                  style={[
                    styles.interestText,
                    selected && styles.interestTextSelected,
                    { fontFamily: Platform.select({
                      ios: 'ChalkboardSE-Regular',
                      android: 'monospace',}), }
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {editing && (
          <TouchableOpacity style={styles.saveButton} onPress={savePreferences}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 18,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  interestButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    marginBottom: 10,
  },
  interestSelected: {
    backgroundColor: '#ffe7ab',
    borderColor: '#e0b145',
  },
  interestText: {
    fontSize: 14,
    color: '#555',
  },
  interestTextSelected: {
    color: '#c08700',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#e0b145',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
    fontWeight: '600',
  },
});