import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/utils/Supabase';
import { getBackendUrl } from '@/utils/api'; 
import { Ionicons } from '@expo/vector-icons';
import AnimatedRefreshButton from '@/components/AnimatedRefreshButton';
import { getAuthBackendUrl, getBookBackendUrl, getBookWsUrl } from '@/utils/apiConfig';


const { width } = Dimensions.get('window');
const BACKEND_URL = getBackendUrl();

type Book = {
  id: string;
  title: string;
  cover: string;
  age_group: string;
};

export default function MainScreen() {
  const [loading, setLoading] = useState(true);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);

  // banner
  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = [
    require('@/assets/images/banner1.png'),
    require('@/assets/images/ad1.png'),
    require('@/assets/images/ad2.png'),
  ];
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentBanner + 1) % banners.length;
      setCurrentBanner(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentBanner, banners.length]);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.replace('/login');
      } else {
        console.log('✅ Logged-in user:', data.user);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const fetchRecommendedBooks = () => {
    fetch(`${BACKEND_URL}/books`)
      .then((res) => res.json())
      .then((data) => {
        const shuffled = data.sort(() => 0.5 - Math.random());
        setRecommendedBooks(shuffled.slice(0, 10));
      });
  };

  useEffect(() => {
    fetchRecommendedBooks();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Banner */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentBanner(index);
        }}
        scrollEventThrottle={16}
        style={styles.bannerContainer}
      >
        {banners.map((banner, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            onPress={() => {
              if (index === 1 || index === 2) {
                router.push('/(parent)/subscription');
              }
            }}
          >
            <Image
              source={banner}
              style={styles.banner}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.dotsContainer}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentBanner === index && styles.activeDot,
            ]}
          />
        ))}
      </View>


      {/* Icon Row */}
      <View style={styles.iconRow}>
        <TouchableOpacity onPress={() => router.push('/chat')} style={styles.iconButton}>
          <Image source={require('@/assets/images/ai.png')} style={styles.iconImage} />
          <Text style={styles.iconLabel}>AI</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Image source={require('@/assets/images/learning.png')} style={styles.iconImage} />
          <Text style={styles.iconLabel}>Learning</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/library')} style={styles.iconButton}>
          <Image source={require('@/assets/images/library.png')} style={styles.iconImage} />
          <Text style={styles.iconLabel}>Library</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/reward')} style={styles.iconButton}>
          <Image source={require('@/assets/images/reward.png')} style={styles.iconImage} />
          <Text style={styles.iconLabel}>Reward</Text>
        </TouchableOpacity>
      </View>

      {/* Recommended Books */}
      <View style={styles.recommendHeader}>
        <Text style={styles.recommendTitleText}>Recommended Books</Text>
        {/* <TouchableOpacity onPress={fetchRecommendedBooks} style={styles.refreshButton}>
          <Text style={styles.refreshText}>
            <Ionicons name="refresh" size={24}></Ionicons>
          </Text>
        </TouchableOpacity> */}
        <AnimatedRefreshButton onRefresh={fetchRecommendedBooks} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 40 }}>
        {recommendedBooks.map((book) => (
          <TouchableOpacity
            key={book.id}
            onPress={() => router.push(`/(library)/${book.id}`)}
            style={styles.recommendCard}
          >
            <Image source={{ uri: `${BACKEND_URL}${book.cover}` }} style={styles.recommendCover} />
            <Text numberOfLines={2} style={styles.recommendBookTitle}>{book.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  banner: {
    width: width - 40, 
    height: (width - 40) * 1024 / 1536, 
    borderRadius: 12,
    marginBottom: 16,
  },
  bannerText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 24,
  },
  iconButton: {
    alignItems: 'center',
  },
  iconImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  iconLabel: {
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
    fontSize: 18,
    // color: '#E5911B',
    color: '#666666',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  recommendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    // color: '#666666',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  refreshButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshText: {
    fontSize: 30,
  },
  recommendCard: {
    width: 120,
    marginRight: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 6,
    elevation: 2,
  },
  recommendCover: {
    width: 100,
    height: 130,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  recommendBookTitle: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    // color: '#E5911B',
    color: '#666666',
    width: 100,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  bannerContainer: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    marginTop: 10,    
    marginBottom: 10, 
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#E5911B',
  },
});
