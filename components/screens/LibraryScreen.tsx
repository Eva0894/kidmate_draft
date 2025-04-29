// LibraryScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/Supabase';
import { useSession } from '@supabase/auth-helpers-react';
import { commonstyle } from '@/style/commonstyle';
import { Platform } from 'react-native';

const { width } = Dimensions.get('window');

const categories = [
  {
    title: 'Story',
    image: require('../../assets/images/story.png'),
  },
  {
    title: 'Science',
    image: require('../../assets/images/science.png'),
  },
  {
    title: 'Plant',
    image: require('../../assets/images/plant.png'),
  },
  {
    title: 'Animal',
    image: require('../../assets/images/animal.png'),
  },
];

export default function LibraryScreen() {
  const router = useRouter();
  const session = useSession();
  const [recents, setRecents] = useState<any[]>([]);

  useEffect(() => {
    if (!session?.user) return;

    supabase
      .from('reading_progress')
      .select('book_id, current_page, total_pages, updated_at, books (title, cover_url)')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setRecents(data || []));
  }, [session]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.header}>My Library</Text>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Ionicons name="search" size={28} color="#E5911B" />
        </TouchableOpacity>
      </View>

      <Image
        source={require('../../assets/images/banner.png')}
        style={styles.banner}
        resizeMode="cover"
      />

      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/favourite')}>
          <Ionicons name="heart" size={32} color="red" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/bookmark')}>
          <Ionicons name="bookmark" size={32} color="#555" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Digital Library</Text>
      <View style={styles.categoryRow}>
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={styles.catItem}
            // onPress={() => router.push({ pathname: '/[category]', params: { type: cat.title } })}
            onPress={() =>
              router.push({
                pathname: '/(library)/[category]',
                params: { category: cat.title.toLowerCase() },
              })
            }
          >
            <Image source={cat.image} style={styles.catImage} />
            <Text style={styles.catLabel}>{cat.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recent</Text>
      <View style={styles.recentRow}>
        {recents.map((item, index) => (
          <TouchableOpacity
            key={item.book_id}
            style={styles.recentItem}
            onPress={() =>
              router.push({
                pathname: '/bookId' as const,
                params: {
                  id: item.book_id,
                  page: String(item.current_page || 0),
                },
              })
            }
          >
            <Image
              source={{ uri: item.books?.cover_url || '' }}
              style={styles.recentImage}
            />
            <View style={styles.progressBarWrap}>
              <View
                style={[styles.progressBarFill, {
                  width: `${(item.current_page / item.total_pages) * 100}%`
                }]}
              />
            </View>
            <Text style={styles.recentLabel}>{item.books?.title || 'Untitled'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E5911B',
    marginBottom: 8,
    marginTop: 12,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
  },
  
  banner: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  iconButton: {
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  catItem: {
    width: (width - 80) / 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  catImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 6,
  },
  catLabel: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: Platform.select({
          ios: 'ChalkboardSE-Regular',
          android: 'casual',}),
    color: '#E5911B',
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  recentItem: {
    width: (width - 60) / 2,
    marginBottom: 20,
  },
  recentImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#eee',
  },
  progressBarWrap: {
    width: '100%',
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#4CAF50',
  },
  recentLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
});
