import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/utils/Supabase';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import eduStyles from '../eduStyles';

const categories = [
  {
    title: 'Art',
    image: require('../../../assets/images/art.png'),
  },
  {
    title: 'Sport',
    image: require('../../../assets/images/sport.png'),
  },
  {
    title: 'Language',
    image: require('../../../assets/images/art.png'),
  },
  {
    title: 'Science',
    image: require('../../../assets/images/art.png'),
  },
  {
    title: 'Math',
    image: require('../../../assets/images/art.png'),
  },
];

const recentVideos = [
  {
    title: "Intro to Colors",
    image: require('../../../assets/images/art.png'),
    progress: 0.8,
  },
  {
    title: 'Counting Fun',
    image: require('../../../assets/images/art.png'),
    progress: 1,
    favorite: true,
  },
  {
    title: "Basic Shapes",
    image: require('../../../assets/images/art.png'),
    progress: 0.6,
  },
];

export default function CoursePage() {
  const [seconds, setSeconds] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const start = Date.now();
    const timer = setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
  
    return () => {
      clearInterval(timer);
      const duration = Math.floor((Date.now() - start) / 1000);
      console.log('📤 页面卸载，准备上传学习记录:', {
        user_id: userId,
        category: 'course',
        duration_sec: duration,
      });
  
      if (duration > 0) {
        supabase.from('study_log').insert({
          user_id: userId,
          category: 'course',
          duration_sec: duration,
        })
        .then(({ error }) => {
          if (error) {
            console.error('上传失败:', error.message);
          } else {
            console.log('学习时长成功上传！');
          }
        });
      }
    };
  }, [userId]);
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={eduStyles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#D4A017" />
        <Text style={eduStyles.backText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <Ionicons name="person-circle" size={36} color="#DDAA00" />
        <Text style={styles.timer}>Today: {formatTime(seconds)}</Text>
        <Ionicons name="search" size={24} color="#DDAA00" style={styles.icon} />
      </View>

      <Text style={styles.sectionTitle}>Course</Text>
      <Image
        source={require('../../../assets/images/banner.png')}
        style={styles.banner}
        resizeMode="cover"
      />

      <Text style={styles.sectionTitle}>Classification</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {categories.map((cat, index) => (
          <View key={index} style={styles.categoryItem}>
            <Image source={cat.image} style={styles.categoryImage} />
            <Text style={styles.categoryTitle}>{cat.title}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Recent</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recentVideos.map((video, index) => (
          <View key={index} style={styles.bookItem}>
            <Image source={video.image} style={styles.bookImage} />
            <Text style={styles.bookTitle}>{video.title}</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${video.progress * 100}%` }]} />
            </View>
            {video.favorite && <Ionicons name="star" size={18} color="#f9c400" style={styles.starIcon} />}
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  icon: {
    marginHorizontal: 8,
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#D38300',
  },
  banner: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  categoryTitle: {
    marginTop: 6,
    fontWeight: '600',
    color: '#a66f00',
  },
  bookItem: {
    width: 120,
    marginRight: 16,
    alignItems: 'center',
  },
  bookImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  bookTitle: {
    marginTop: 4,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    width: '100%',
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#d28c00',
    borderRadius: 3,
  },
  starIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
