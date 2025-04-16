import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/utils/Supabase';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import { CourseTimeProvider } from '@/components/CourseTimeProvider';
import ProfilePopover from '@/components/ProfilePopover';
import eduStyles from '../eduStyles';
import { TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';

const categories = [
  { title: 'Art', image: require('../../../assets/images/art.png') },
  { title: 'Sport', image: require('../../../assets/images/sport.png') },
  { title: 'Language', image: require('../../../assets/images/art.png') },
  { title: 'Science', image: require('../../../assets/images/art.png') },
  { title: 'Math', image: require('../../../assets/images/art.png') },
];

const recentVideos = [
  { title: 'Intro to Colors', image: require('../../../assets/images/art.png'), progress: 0.8 },
  { title: 'Counting Fun', image: require('../../../assets/images/art.png'), progress: 1, favorite: true },
  { title: 'Basic Shapes', image: require('../../../assets/images/art.png'), progress: 0.6 },
];

export default function CoursePage() {
  const [totalToday, setTotalToday] = useState(0);
  const [byCategory, setByCategory] = useState<{ [key: string]: number }>({});
  const [profile, setProfile] = useState<{ username: string; email: string } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchStudyTime = async () => {
      const today = dayjs().startOf('day').toISOString();
      const { data, error } = await supabase
        .from('study_log')
        .select('category, duration_sec')
        .gte('created_at', today);

      if (!error && data) {
        const total = data.reduce((sum, row) => sum + row.duration_sec, 0);
        const categoryMap: { [key: string]: number } = {};
        data.forEach((row) => {
          categoryMap[row.category] = (categoryMap[row.category] || 0) + row.duration_sec;
        });
        setTotalToday(total);
        setByCategory(categoryMap);
      }
    };

    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('users')
        .select('username, email')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile({ username: data.username, email: data.email });
      }

      await supabase.from('notifications').insert({
        user_id: user.id,
        title: '📚 New Course Release!',
        content: 'Click here to start learning!',
      });
    };

    fetchStudyTime();
    fetchUserProfile();
  }, []);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <CourseTimeProvider>
      <TouchableWithoutFeedback onPress={() => setShowProfile(false)}>
        <View style={styles.container}>
          <TouchableOpacity style={eduStyles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#D4A017" />
          </TouchableOpacity>
          <View style={styles.header}>

            <TouchableOpacity
              onPress={() => {
                console.log('👤 Toggle');
                setShowProfile((prev) => !prev);
              }}
              style={{ alignSelf: 'center' }}
            >
              <Ionicons name="person-circle" size={48} color="orange" />
            </TouchableOpacity>
            <Text style={styles.timer}>Today: {formatTime(totalToday)}</Text>
            <Ionicons name="search" size={24} color="#DDAA00" style={styles.icon} />
          </View>

          <ProfilePopover visible={showProfile} />

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionTitle}>Course</Text>
            <Image source={require('../../../assets/images/banner.png')} style={styles.banner} resizeMode="cover" />

            <Text style={styles.sectionTitle}>Classification</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryItem}
                onPress={() =>
                  router.push({
                    pathname: '/(edu)/(course)/[category]',
                    params: { category: cat.title.toLowerCase() },
                  })
                }
              >
                <Image source={cat.image} style={styles.categoryImage} />
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                {byCategory[cat.title.toLowerCase()] && (
                  <Text style={styles.duration}>
                    ⏱ {formatTime(byCategory[cat.title.toLowerCase()] || 0)}
                  </Text>
                )}
              </TouchableOpacity>
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
                  {video.favorite && (
                    <Ionicons name="star" size={18} color="#f9c400" style={styles.starIcon} />
                  )}
                </View>
              ))}
            </ScrollView>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </CourseTimeProvider>
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
  duration: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
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