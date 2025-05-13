import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProfilePopover from '@/components/ProfilePopover';
import eduStyles from '../eduStyles';
import { supabase } from '@/utils/Supabase';

const categories = [
  { title: 'phonics', image: require('../../../assets/images/3_7.jpg') },
  { title: 'number', image: require('../../../assets/images/3_16.jpg') },
  { title: 'nursery', image: require('../../../assets/images/3_17.jpg') },
  { title: 'magic', image: require('../../../assets/images/4_6.jpg') },
  { title: 'fun', image: require('../../../assets/images/4_7.jpg') },
  { title: 'soft', image: require('../../../assets/images/4_8.jpg') },
];

export default function SongPage() {
  const [totalToday] = useState(0);
  const [byCategory] = useState<{ [key: string]: number }>({});
  const [profile, setProfile] = useState<{ username: string; email: string } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [recentSongs, setRecentSongs] = useState<any[]>([]);
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRecentSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('recent_played_at', { ascending: false })
        .limit(5);
      if (!error) setRecentSongs(data || []);
    };
    const fetchAllSongs = async () => {
      const { data, error } = await supabase.from('songs').select('*');
      if (!error) setAllSongs(data || []);
    };
    fetchRecentSongs();
    fetchAllSongs();
  }, []);

  const filteredSongs = allSongs.filter((song) =>
    song.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <TouchableWithoutFeedback onPress={() => setShowProfile(false)}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/eduPage')}>
            <Ionicons name="arrow-back" size={28} color="#E5911B" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowProfile((prev) => !prev)}
            style={{ alignSelf: 'center' }}
          >
            <Ionicons name="person-circle" size={48} color="#E5911B" />
          </TouchableOpacity>
          <Text style={styles.timer}>Today: {formatTime(totalToday)}</Text>
          <TouchableOpacity onPress={() => setShowSearch((prev) => !prev)}>
            <Ionicons name="search" size={28} color="#E5911B" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(edu)/(song)/favorite')}>
            <Ionicons name="heart" size={32} color='red' />
          </TouchableOpacity>
        </View>

        <ProfilePopover visible={showProfile} />
        {showSearch && (
          <TextInput
            placeholder="Search songs..."
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        )}
        {showSearch && searchText !== '' && (
          <View style={{ marginTop: 10 }}>
            {filteredSongs.map((song, index) => (
              <TouchableOpacity
                key={song.id}
                onPress={() =>
                  router.push({
                    pathname: '/(edu)/(song)/player',
                    params: {
                      id: song.id.toString(),
                      index: index.toString(),
                      songs: JSON.stringify(filteredSongs),
                    },
                  })
                }
              >
                <Text style={styles.searchResultTitle}>{song.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Music</Text>
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
                  router.push({
                    pathname: '/(edu)/(song)/[category]',
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
            {recentSongs.map((song, index) => (
              <TouchableOpacity
                key={song.id}
                onPress={() =>
                  router.push({
                    pathname: '/(edu)/(song)/player',
                    params: {
                      id: song.id.toString(),
                      index: index.toString(),
                      songs: JSON.stringify(recentSongs),
                    },
                  })
                }
              >
                <Image source={{ uri: song.cover_url }} style={styles.bookImage} />
                <Text style={styles.bookTitle} numberOfLines={1}>{song.title}</Text>
                {song.favorite && (
                  <Ionicons name="heart" size={18} color="#f44336" style={styles.starIcon} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
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
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
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
    fontSize: 18,
    fontWeight: '600',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
  },
  duration: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  bookImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  bookTitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#E5911B',
    fontWeight: '600',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
  },
  starIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  searchInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
  },
  searchResultTitle: {
    padding: 8,
    fontSize: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
  },
});
