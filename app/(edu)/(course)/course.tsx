import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, TouchableWithoutFeedback, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/Supabase';
import { CourseTimeProvider } from '@/components/CourseTimeProvider';
import ProfilePopover from '@/components/ProfilePopover';
import eduStyles from '../eduStyles';
import dayjs from 'dayjs'; 
const categories = [
  { title: 'language', image: require('../../../assets/images/language.jpg') },
  { title: 'math', image: require('../../../assets/images/math.jpg') },
  { title: 'science', image: require('../../../assets/images/science.jpg') },
  { title: 'chess', image: require('../../../assets/images/chess.jpg') },
  { title: 'social studies', image: require('../../../assets/images/social studies.jpg') },
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
          <View style={styles.header}>
              <TouchableOpacity onPress={() => router.push('/eduPage')} style={styles.icon}>
                <Ionicons name="arrow-back" size={28} color="#E5911B" />
              </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowProfile((prev) => !prev)}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <Ionicons name="person-circle" size={48} color="#E5911B" />
              )}
            </TouchableOpacity>

            <Text style={styles.timer}>Today: {formatTime(totalToday)}</Text>

            <TouchableOpacity onPress={() => setShowSearch((prev) => !prev)}>
              <Ionicons name="search" size={28} color="#E5911B" style={styles.icon} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(edu)/(course)/favorite')}>
              <Ionicons name="heart" size={32} color='red' />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12},
  icon: { marginHorizontal: 8 },
  timer: { fontSize: 16, fontWeight: 'bold', color: 'green' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#E5911B', fontFamily: Platform.select({
    ios: 'ChalkboardSE-Regular',
    android: 'monospace',}), },
  banner: { width: '100%', height: 160, borderRadius: 10 },
  categoryItem: { alignItems: 'center', marginRight: 16 },
  categoryImage: { width: 80, height: 80, borderRadius: 12 },
  categoryTitle: { fontSize: 18, marginTop: 6, fontWeight: '600', color: '#E5911B', fontFamily: Platform.select({
    ios: 'ChalkboardSE-Regular',
    android: 'monospace',}),},
  searchInput: { borderWidth: 1, fontSize: 16, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, fontFamily: Platform.select({
    ios: 'ChalkboardSE-Regular',
    android: 'monospace',}), },
  resultItem: { paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderColor: '#eee', fontSize: 16, color: '#333', fontFamily: Platform.select({
    ios: 'ChalkboardSE-Regular',
    android: 'monospace',}), },
  bookItem: { width: 120, marginRight: 16, alignItems: 'center' },
  bookImage: { width: 120, height: 120, borderRadius: 12 },
  bookTitle: { marginTop: 4, fontWeight: '600',fontSize: 14, color: '#E5911B',fontFamily: Platform.select({
    ios: 'ChalkboardSE-Regular',
    android: 'monospace',}), },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ccc' },
});
