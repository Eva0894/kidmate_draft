import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../utils/Supabase';
import { useRouter } from 'expo-router';
import meStyles from './meStyles';


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
      const id = userData?.user?.id;
      if (!id) return;

      setUserId(id);

      const { data, error } = await supabase
        .from('personalization')
        .select('interest, favorite_activity')
        .eq('user_id', id)
        .single();

      if (!error && data) {
        setSelectedInterests(data.interest || []);
        setFavoriteActivity(data.favorite_activity || '');
      }
    };

    loadData();
  }, []);

  const toggleInterest = (item: string) => {
    if (!editing) return;
    setSelectedInterests((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };
  const handleSave = async () => {
    if (!userId) return;
  
    const { error } = await supabase
      .from('personalization')
      .update({
        interest: selectedInterests,
        favorite_activity: favoriteActivity,
      })
      .eq('user_id', userId);
  
    if (error) {
      Alert.alert('Update failed', error.message);
    } else {
      Alert.alert('Saved successfully!');
      setEditing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 顶部标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={meStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#D4A017" />
          <Text style={meStyles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Personalization</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Ionicons
            name={editing ? 'close-outline' : 'create-outline'}
            size={24}
            color="#e0b145"
          />
        </TouchableOpacity>
      </View>

      {/* 兴趣区域 */}
      <Text style={styles.label}>Interest</Text>
      <View style={styles.interestsContainer}>
        {INTEREST_OPTIONS.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.interestButton,
              selectedInterests.includes(item) && styles.interestSelected,
              !editing && { opacity: 0.6 },
            ]}
            onPress={() => toggleInterest(item)}
          >
            <Text
              style={[
                styles.interestText,
                selectedInterests.includes(item) && styles.interestTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 喜好活动 */}
      <Text style={styles.label}>Favorite Activity</Text>
        <View style={styles.interestsContainer}>
          {ACTIVITY_OPTIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.interestButton,
                favoriteActivity === item && styles.interestSelected,
                !editing && { opacity: 0.6 },
              ]}
              onPress={() => editing && setFavoriteActivity(item)}
            >
              <Text
                style={[
                  styles.interestText,
                  favoriteActivity === item && styles.interestTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      {/* 保存按钮 */}
      {editing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffdf6',
    padding: 24,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 24,
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
    fontWeight: '600',
  },
});