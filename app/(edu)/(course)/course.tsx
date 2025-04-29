/*
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
import { Session } from '@supabase/supabase-js';

const categories = [
  { title: 'Chess', image: require('../../../assets/images/art.png') },
  { title: 'Social Studies', image: require('../../../assets/images/sport.png') },
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
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ username: string; email: string } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  useEffect(() => {
    
    const fetchAvatar = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('获取 session 失败:', sessionError.message);
        return;
      }

      const userId = session?.user.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('获取头像失败:', error.message);
      } else {
        setAvatarUrl(data?.avatar_url || null);
      }
    };

    fetchAvatar();
  }, []);

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
            <Ionicons name="arrow-back" size={32} color="#E5911B" />
          </TouchableOpacity>
          <View style={styles.header}>

            <TouchableOpacity
              onPress={() => {
                console.log('👤 Toggle');
                setShowProfile((prev) => !prev);
              }}
              style={{ alignSelf: 'center' }}
            >
              <View style={styles.avatarWrapper}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                    onError={(e) => console.log('图片加载失败', e.nativeEvent.error)}
                  />
                ) : (
                    <Text style={styles.placeholder}>🧑‍🦱</Text>
                  )}
                </View>
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
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  placeholder: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoCard: {
    marginTop: 12,
    backgroundColor: '#fff7e6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    alignItems: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  emailText: {
    fontSize: 14,
    color: '#666',
  },
});
*/

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/Supabase';
import { CourseTimeProvider } from '@/components/CourseTimeProvider';
import ProfilePopover from '@/components/ProfilePopover';
import eduStyles from '../eduStyles';
import dayjs from 'dayjs'; // ✅ 需要补上
const categories = [
  { title: 'language', image: require('../../../assets/images/art.png') },
  { title: 'math', image: require('../../../assets/images/sport.png') },
  { title: 'science', image: require('../../../assets/images/art.png') },
  { title: 'chess', image: require('../../../assets/images/art.png') },
  { title: 'social studies', image: require('../../../assets/images/art.png') },
];

export default function CoursePage() {
  const router = useRouter();
  const [totalToday, setTotalToday] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecentCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .not('recent_played_at', 'is', null)
        .order('recent_played_at', { ascending: false })
        .limit(5);

      if (!error && data) setRecentCourses(data);
    };

    fetchRecentCourses();
  }, []);

  useEffect(() => {
    const search = async () => {
      if (!searchText.trim()) {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .ilike('title', `%${searchText}%`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSearchResults(data);
      }
    };

    search();
  }, [searchText]);

  useEffect(() => {
    const fetchAvatarAndStudyTime = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError.message);
        return;
      }

      const userId = session?.user.id;
      if (!userId) return;

      const { data: avatarData } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('user_id', userId)
        .single();
      
      if (avatarData) {
        setAvatarUrl(avatarData.avatar_url || null);
      }

      const today = dayjs().startOf('day').toISOString();
      const { data: studyData } = await supabase
        .from('study_log')
        .select('duration_sec')
        .gte('created_at', today);

      if (studyData) {
        const total = studyData.reduce((sum, row) => sum + row.duration_sec, 0);
        setTotalToday(total);
      }
    };

    fetchAvatarAndStudyTime();
  }, []);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <CourseTimeProvider>
      <TouchableWithoutFeedback onPress={() => setShowProfile(false)}>
        <View style={styles.container}>
          <TouchableOpacity style={eduStyles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#D4A017" />
          </TouchableOpacity>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowProfile((prev) => !prev)}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <Ionicons name="person-circle" size={48} color="orange" />
              )}
            </TouchableOpacity>

            <Text style={styles.timer}>Today: {formatTime(totalToday)}</Text>

            <TouchableOpacity onPress={() => setShowSearch((prev) => !prev)}>
              <Ionicons name="search" size={24} color="#DDAA00" style={styles.icon} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(edu)/(course)/favorite')}>
              <Ionicons name="heart" size={24} color="#D38300" />
            </TouchableOpacity>
          </View>

          <ProfilePopover visible={showProfile} />

          {showSearch && (
            <TextInput
              placeholder="Search courses..."
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
          )}

          {searchText.trim() ? (
            <ScrollView>
              <Text style={styles.sectionTitle}>Search Results</Text>
              {searchResults.length === 0 ? (
                <Text style={{ marginBottom: 20, color: '#888' }}>No results found.</Text>
              ) : (
                searchResults.map((video) => (
                  <TouchableOpacity
                    key={video.id}
                    onPress={() =>
                      router.push({ pathname: '/(edu)/(course)/player', params: { id: video.id.toString(), title: video.title, url: video.video_url } })
                    }
                  >
                    <Text style={styles.resultItem}>{video.title}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.sectionTitle}>Course</Text>
              <Image
                source={require('../../../assets/images/banner.png')}
                style={styles.banner}
                resizeMode="cover"
              />

              <Text style={styles.sectionTitle}>Classification</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {categories.map((cat, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.categoryItem}
                    onPress={() =>
                      router.push({ pathname: '/(edu)/(course)/[category]', params: { category: cat.title.toLowerCase() } })
                    }
                  >
                    <Image source={cat.image} style={styles.categoryImage} />
                    <Text style={styles.categoryTitle}>{cat.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionTitle}>Recent</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recentCourses.map((video) => (
                  <TouchableOpacity
                    key={video.id}
                    style={styles.bookItem}
                    onPress={() =>
                      router.push({ pathname: '/(edu)/(course)/player', params: { id: video.id.toString(), title: video.title, url: video.video_url } })
                    }
                  >
                    <Image source={{ uri: video.cover_url }} style={styles.bookImage} />
                    <Text style={styles.bookTitle} numberOfLines={1}>{video.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>
          )}
        </View>
      </TouchableWithoutFeedback>
    </CourseTimeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  icon: { marginHorizontal: 8 },
  timer: { fontSize: 16, fontWeight: 'bold', color: 'green' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#D38300' },
  banner: { width: '100%', height: 160, borderRadius: 10 },
  categoryItem: { alignItems: 'center', marginRight: 16 },
  categoryImage: { width: 80, height: 80, borderRadius: 12 },
  categoryTitle: { marginTop: 6, fontWeight: '600', color: '#a66f00' },
  searchInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  resultItem: { paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderColor: '#eee', fontSize: 16, color: '#333' },
  bookItem: { width: 120, marginRight: 16, alignItems: 'center' },
  bookImage: { width: 120, height: 120, borderRadius: 12 },
  bookTitle: { marginTop: 4, fontWeight: '600' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ccc' },
});
