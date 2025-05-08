import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/utils/Supabase';

const { width } = Dimensions.get('window');
const AGE_OPTIONS = ['Age 3-4', 'Age 5-6', 'Age 7+'];
const BACKEND_URL = 'http://10.19.141.103:8000';
type Book = {
  id: string;
  title: string;
  cover: string;
  age_group: string;
};

export default function MainScreen() {
  const [loading, setLoading] = useState(true);
  const [selectedAge, setSelectedAge] = useState('Age 3-4');
  const [showDropdown, setShowDropdown] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);

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

  const handleAgeSelect = (age: string) => {
    setSelectedAge(age);
    setShowDropdown(false);
  };

  const fetchRecommendedBooks = () => {
    fetch(`${BACKEND_URL}/books`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((book: any) => book.age_group === selectedAge);
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setRecommendedBooks(shuffled.slice(0, 10));
      });
  };

  useEffect(() => {
    fetchRecommendedBooks();
  }, [selectedAge]);

  // const handleSignOut = async () => {
  //   await supabase.auth.signOut();
  //   router.replace('/login');
  // };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Age dropdown 放在 ScrollView 外部，避免遮挡问题 */}
      {showDropdown && (
        <View
          style={[
            styles.dropdown,
            {
              position: 'absolute',
              top: 70, // 根据你的实际布局可微调
              left: 20,
              zIndex: 100,
            },
          ]}
        >
          {AGE_OPTIONS.map((age) => (
            <TouchableOpacity key={age} onPress={() => handleAgeSelect(age)}>
              <Text style={styles.dropdownItem}>{age}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
  
      {/* 主内容 ScrollView */}
      <ScrollView style={styles.container}>
        {/* Header: Age selector */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)} style={styles.ageTag}>
            <Text style={styles.ageText}>👤 {selectedAge} ⌄</Text>
          </TouchableOpacity>
  
          {/* 如果你想恢复退出按钮，可以放在这里 */}
          {/* <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <Text style={styles.logoutIcon}>⏏️</Text>
          </TouchableOpacity> */}
        </View>
  
        {/* Banner */}
        <Image
          source={require('@/assets/images/banner-image.png')}
          style={styles.banner}
        />
        <Text style={styles.bannerText}>Hi! I'm your AI learning companion</Text>
  
        {/* Navigation Icons */}
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => router.push('/chat')}>
            <Image source={require('@/assets/images/ai.png')} style={styles.iconImage} />
            <Text style={styles.iconLabel}>AI</Text>
          </TouchableOpacity>
  
          <TouchableOpacity>
            <Image source={require('@/assets/images/learning.png')} style={styles.iconImage} />
            <Text style={styles.iconLabel}>Learning</Text>
          </TouchableOpacity>
  
          <TouchableOpacity onPress={() => router.push('/library')}>
            <Image source={require('@/assets/images/library.png')} style={styles.iconImage} />
            <Text style={styles.iconLabel}>Library</Text>
          </TouchableOpacity>
  
          <TouchableOpacity onPress={() => router.push('/reward')}>
            <Image source={require('@/assets/images/reward.png')} style={styles.iconImage} />
            <Text style={styles.iconLabel}>Reward</Text>
          </TouchableOpacity>
        </View>
  
        {/* Recommendation Header */}
        <View style={styles.recommendHeader}>
          <Text style={styles.recommendTitleText}>
            Recommended Books for {selectedAge}
          </Text>
          <TouchableOpacity onPress={fetchRecommendedBooks} style={styles.refreshButton}>
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        </View>
  
        {/* Recommended Book List */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 40 }}>
          {recommendedBooks.map((book) => (
            <TouchableOpacity
              key={book.id}
              onPress={() => router.push(`/book/${book.id}`)}
              style={styles.recommendCard}
            >
              <Image
                source={{ uri: `${BACKEND_URL}${book.cover}` }}
                style={styles.recommendCover}
              />
              <Text numberOfLines={2} style={styles.recommendBookTitle}>
                {book.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ageTag: {
    backgroundColor: '#FFF0D9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFD580',
  },
  ageText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
    fontFamily: 'ChalkboardSE-Regular',
  },
  dropdown: {
    position: 'absolute',
    top: 36,
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    fontFamily: 'ChalkboardSE-Regular',
  },
  banner: {
    width: width - 40,
    height: 120,
    borderRadius: 16,
    marginTop: 10,
    alignSelf: 'center',
    resizeMode: 'contain', 
    backgroundColor: '#FFFDF4',
    zIndex: 1,
    position: 'relative',
  },
  bannerText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    fontFamily: 'ChalkboardSE-Regular',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 28,
    marginBottom: 10,
  },
  iconImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconLabel: {
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    fontFamily: 'ChalkboardSE-Regular',
  },
  recommendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 12,
  },
  recommendTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'ChalkboardSE-Regular',
  },
  refreshButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFECB3',
    borderRadius: 20,
  },
  refreshText: {
    fontSize: 18,
    fontWeight: '600',
  },
  recommendCard: {
    width: 120,
    marginRight: 14,
    alignItems: 'center',
  },
  recommendCover: {
    width: 100,
    height: 130,
    borderRadius: 12,
    backgroundColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  recommendBookTitle: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    width: 100,
    fontFamily: 'ChalkboardSE-Regular',
  },
});