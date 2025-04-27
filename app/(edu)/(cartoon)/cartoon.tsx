
/*
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProfilePopover from '@/components/ProfilePopover';
import { supabase } from '@/utils/Supabase';
import eduStyles from '../eduStyles';

const categories = [
  { title: 'educational cartoon', slug: 'educationalcartoon', image: require('../../../assets/images/3_7.jpg') },
  { title: 'entertainment cartoon', slug: 'entertainmentcartoon', image: require('../../../assets/images/3_16.jpg') },
  { title: 'fantasy cartoon', slug: 'fantasycartoon', image: require('../../../assets/images/4_8.jpg') },
  { title: 'adventure cartoon', slug: 'adventurecartoon', image: require('../../../assets/images/4_7.jpg') },
];

const recentVideos = [
  { title: 'Intro to Colors', image: require('../../../assets/images/art.png'), progress: 0.8 },
  { title: 'Counting Fun', image: require('../../../assets/images/3_17.jpg'), progress: 1, favorite: true },
  { title: 'Basic Shapes', image: require('../../../assets/images/animal.png'), progress: 0.6 },
];

export default function CartoonPage() {
  const [totalToday] = useState(0);
  const [byCategory] = useState<{ [key: string]: number }>({});
  const [profile, setProfile] = useState<{ username: string; email: string } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  useEffect(() => {
    const search = async () => {
      if (!searchText.trim()) {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('cartoon')
        .select('*')
        .ilike('title', `%${searchText}%`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSearchResults(data);
      }
    };
    search();
  }, [searchText]);

  return (
    <TouchableWithoutFeedback onPress={() => setShowProfile(false)}>
      <View style={styles.container}>
        <TouchableOpacity style={eduStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#D4A017" />
        </TouchableOpacity>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowProfile((prev) => !prev)}>
            <Ionicons name="person-circle" size={48} color="orange" />
          </TouchableOpacity>

          <Text style={styles.timer}>Today: {formatTime(totalToday)}</Text>

          <TouchableOpacity onPress={() => setShowSearch((prev) => !prev)}>
            <Ionicons name="search" size={24} color="#DDAA00" style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(edu)/(cartoon)/favorite')}>
            <Ionicons name="heart" size={24} color="#D38300" />
          </TouchableOpacity>
        </View>

        <ProfilePopover visible={showProfile} />

        {showSearch && (
          <TextInput
            placeholder="Search cartoons..."
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
                    router.push({ pathname: '/(edu)/(cartoon)/player', params: { id: video.id.toString() } })
                  }
                >
                  <Text style={styles.resultItem}>{video.title}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        ) : (
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionTitle}>Cartoon Classification</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {categories.map((cat, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryItem}
                  onPress={() =>
                    router.push({ pathname: '/(edu)/(cartoon)/[category]', params: { category: cat.slug } })
                  }
                >
                  <Image source={cat.image} style={styles.categoryImage} />
                  <Text style={styles.categoryTitle}>{cat.title}</Text>
                  {byCategory[cat.slug] && (
                    <Text style={styles.duration}>
                      ⏱ {formatTime(byCategory[cat.slug] || 0)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Recent Cartoons</Text>
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

            <Text style={styles.sectionTitle}>Cartoon</Text>
            <Image
              source={require('../../../assets/images/banner.png')}
              style={styles.banner}
              resizeMode="cover"
            />
          </ScrollView>
        )}
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  resultItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
    color: '#333',
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
*/
/*
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProfilePopover from '@/components/ProfilePopover';
import { supabase } from '@/utils/Supabase';
import eduStyles from '../eduStyles';

const categories = [
  { title: 'educational cartoon', slug: 'educationalcartoon', image: require('../../../assets/images/3_7.jpg') },
  { title: 'entertainment cartoon', slug: 'entertainmentcartoon', image: require('../../../assets/images/3_16.jpg') },
  { title: 'fantasy cartoon', slug: 'fantasycartoon', image: require('../../../assets/images/4_8.jpg') },
  { title: 'adventure cartoon', slug: 'adventurecartoon', image: require('../../../assets/images/4_7.jpg') },
];

export default function CartoonPage() {
  const [totalToday] = useState(0);
  const [byCategory] = useState<{ [key: string]: number }>({});
  const [profile, setProfile] = useState<{ username: string; email: string } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [recentCartoons, setRecentCartoons] = useState<any[]>([]);
  const router = useRouter();

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  useEffect(() => {
    const fetchRecentCartoons = async () => {
      const { data, error } = await supabase
        .from('cartoon')
        .select('*')
        .order('recent_played_at', { ascending: false })
        .limit(5);

      if (!error && data) setRecentCartoons(data);
    };

    fetchRecentCartoons();
  }, []);

  useEffect(() => {
    const search = async () => {
      if (!searchText.trim()) {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('cartoon')
        .select('*')
        .ilike('title', `%${searchText}%`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSearchResults(data);
      }
    };
    search();
  }, [searchText]);

  return (
    <TouchableWithoutFeedback onPress={() => setShowProfile(false)}>
      <View style={styles.container}>
        <TouchableOpacity style={eduStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#D4A017" />
        </TouchableOpacity>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowProfile((prev) => !prev)}>
            <Ionicons name="person-circle" size={48} color="orange" />
          </TouchableOpacity>

          <Text style={styles.timer}>Today: {formatTime(totalToday)}</Text>

          <TouchableOpacity onPress={() => setShowSearch((prev) => !prev)}>
            <Ionicons name="search" size={24} color="#DDAA00" style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(edu)/(cartoon)/favorite')}>
            <Ionicons name="heart" size={24} color="#D38300" />
          </TouchableOpacity>
        </View>

        <ProfilePopover visible={showProfile} />

        {showSearch && (
          <TextInput
            placeholder="Search cartoons..."
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
                    router.push({ pathname: '/(edu)/(cartoon)/player', params: { id: video.id.toString() } })
                  }
                >
                  <Text style={styles.resultItem}>{video.title}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        ) : (
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionTitle}>Cartoon Classification</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {categories.map((cat, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryItem}
                  onPress={() =>
                    router.push({ pathname: '/(edu)/(cartoon)/[category]', params: { category: cat.slug } })
                  }
                >
                  <Image source={cat.image} style={styles.categoryImage} />
                  <Text style={styles.categoryTitle}>{cat.title}</Text>
                  {byCategory[cat.slug] && (
                    <Text style={styles.duration}>
                      ⏱ {formatTime(byCategory[cat.slug] || 0)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Recent Cartoons</Text>
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {recentCartoons.map((video) => (
    <TouchableOpacity
      key={video.id}
      style={styles.bookItem}
      onPress={() =>
        router.push({ pathname: '/(edu)/(cartoon)/player', params: { id: video.id.toString() } })
      }
    >
      <Image source={{ uri: video.cover_url }} style={styles.bookImage} />
      <Text style={styles.bookTitle} numberOfLines={1}>{video.title}</Text>
      {video.favorite && (
        <Ionicons name="heart" size={18} color="#f44336" style={styles.starIcon} />
      )}
    </TouchableOpacity>
  ))}
</ScrollView>

            <Text style={styles.sectionTitle}>Cartoon</Text>
            <Image
              source={require('../../../assets/images/banner.png')}
              style={styles.banner}
              resizeMode="cover"
            />
          </ScrollView>
        )}
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  resultItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
    color: '#333',
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
*/

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import ProfilePopover from '@/components/ProfilePopover';
import { supabase } from '@/utils/Supabase';
import eduStyles from '../eduStyles';

const categories = [
  { title: 'educational cartoon', slug: 'educationalcartoon', image: require('../../../assets/images/3_7.jpg') },
  { title: 'entertainment cartoon', slug: 'entertainmentcartoon', image: require('../../../assets/images/3_16.jpg') },
  { title: 'fantasy cartoon', slug: 'fantasycartoon', image: require('../../../assets/images/4_8.jpg') },
  { title: 'adventure cartoon', slug: 'adventurecartoon', image: require('../../../assets/images/4_7.jpg') },
];

export default function CartoonPage() {
  const [totalToday] = useState(0);
  const [byCategory] = useState<{ [key: string]: number }>({});
  const [profile, setProfile] = useState<{ username: string; email: string } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [recentCartoons, setRecentCartoons] = useState<any[]>([]);
  const router = useRouter();

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ✅ 替代 useEffect，用 focus 刷新 recentCartoons
  useFocusEffect(
    useCallback(() => {
      const fetchRecentCartoons = async () => {
        const { data, error } = await supabase
        .from('cartoon')
        .select('*')
        .not('recent_played_at', 'is', null) // ✅ 只取非空值
        .order('recent_played_at', { ascending: false })
          .limit(3);

        if (!error && data) setRecentCartoons(data);
      };

      fetchRecentCartoons();
    }, [])
  );

  useEffect(() => {
    const search = async () => {
      if (!searchText.trim()) {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('cartoon')
        .select('*')
        .ilike('title', `%${searchText}%`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSearchResults(data);
      }
    };
    search();
  }, [searchText]);

  return (
    <TouchableWithoutFeedback onPress={() => setShowProfile(false)}>
      <View style={styles.container}>
        <TouchableOpacity style={eduStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#D4A017" />
        </TouchableOpacity>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowProfile((prev) => !prev)}>
            <Ionicons name="person-circle" size={48} color="orange" />
          </TouchableOpacity>

          <Text style={styles.timer}>Today: {formatTime(totalToday)}</Text>

          <TouchableOpacity onPress={() => setShowSearch((prev) => !prev)}>
            <Ionicons name="search" size={24} color="#DDAA00" style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(edu)/(cartoon)/favorite')}>
            <Ionicons name="heart" size={24} color="#D38300" />
          </TouchableOpacity>
        </View>

        <ProfilePopover visible={showProfile} />

        {showSearch && (
          <TextInput
            placeholder="Search cartoons..."
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
                    router.push({ pathname: '/(edu)/(cartoon)/player', params: { id: video.id.toString() } })
                  }
                >
                  <Text style={styles.resultItem}>{video.title}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        ) : (
          <ScrollView keyboardShouldPersistTaps="handled">
             <Text style={styles.sectionTitle}>Cartoon</Text>
            <Image
              source={require('../../../assets/images/banner.png')}
              style={styles.banner}
              resizeMode="cover"
            />
            <Text style={styles.sectionTitle}>Cartoon Classification</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {categories.map((cat, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryItem}
                  onPress={() =>
                    router.push({ pathname: '/(edu)/(cartoon)/[category]', params: { category: cat.slug } })
                  }
                >
                  <Image source={cat.image} style={styles.categoryImage} />
                  <Text style={styles.categoryTitle}>{cat.title}</Text>
                  {byCategory[cat.slug] && (
                    <Text style={styles.duration}>
                      ⏱ {formatTime(byCategory[cat.slug] || 0)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Recent Cartoons</Text>
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {recentCartoons.map((video) => (
    <TouchableOpacity
      key={video.id}
      style={styles.bookItem}
      onPress={() =>
        router.push({ pathname: '/(edu)/(cartoon)/player', params: { id: video.id.toString() } })
      }
    >
      <Image source={{ uri: video.cover_url }} style={styles.bookImage} />
      <Text style={styles.bookTitle} numberOfLines={1}>{video.title}</Text>
      {video.favorite && (
        <Ionicons name="heart" size={18} color="#f44336" style={styles.starIcon} />
      )}
    </TouchableOpacity>
  ))}
</ScrollView>

            
          </ScrollView>
        )}
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  resultItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
    color: '#333',
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