import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/Supabase';

const categories = [
  'Language',
  'Math',
  'Science',
  'Art',
  'Sport',
  'Emotion',
];

export default function CourseCategoryScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('Language');
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const folder = 'Language'; 
      console.log('尝试读取文件夹:', folder);
      console.log('Fetching from folder:', selected);
      const { data, error } = await supabase
        .storage
        .from('courses')
        .list('', { limit: 100 });
        // .list(selected, { limit: 100 });

      console.log('Video data:', data);
      console.log('Error if any:', error);
      console.log('📂', data);

      if (error) {
        console.error(`Failed to fetch ${selected} videos:`, error.message);
        console.log('Videos:', data);
        // setVideos([]);
        return;
      }

      setVideos(data);
    };

    fetchVideos();
  }, [selected]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#D38300" />
        </TouchableOpacity>
        <Text style={styles.title}>Courses</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Sidebar + Content */}
      <View style={styles.row}>
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, selected === cat && styles.selectedBtn]}
                onPress={() => setSelected(cat)}
              >
                <Text style={[styles.categoryText, selected === cat && styles.selectedText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Video List */}
        <View style={styles.contentArea}>
          <ScrollView>
            {videos.length === 0 ? (
              <Text style={{ color: '#aaa' }}>No videos found.</Text>
            ) : (
              videos.map((video) => (
                <View key={video.name} style={{ marginBottom: 10 }}>
                  <Text style={{ color: '#333' }}>🎬 {video.name}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D38300',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 100,
    backgroundColor: '#E5E5E5',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingVertical: 16,
  },
  categoryBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  selectedBtn: {
    backgroundColor: '#fff',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#c47a00',
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#D38300',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginLeft: -8,
    padding: 16,
  },
});