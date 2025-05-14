import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import libStyles from '../libStyles';
import { getBackendUrl } from '@/utils/api'; 

const BACKEND_URL = getBackendUrl();

const { width } = Dimensions.get('window');

const CATEGORIES = ['story', 'science', 'plant', 'animal', 'art', 'sport'];

export default function CategoryScreen() {
  const { category } = useLocalSearchParams();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState(
    typeof category === 'string' ? category.toLowerCase() : 'story'
  );
  const [books, setBooks] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/books`)
      .then(res => res.json())
      .then(data => {
        console.log('📚 所有图书:', data);
        const filtered = data.filter(
          (book: any) =>
            book.category &&
            book.category.toLowerCase?.() === selectedCategory.toLowerCase()
        );
        setBooks(filtered);
      })
      .catch(err => console.error('Failed to fetch books:', err));
  }, [selectedCategory]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/books/favorites`)
      .then(async res => {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          setFavoriteIds(json || []);
        } catch (e) {
          console.error("❌ 无法解析 JSON，原始内容:", text);
        }
      })
      .catch(err => console.error('Failed to fetch favorites:', err));
  }, []);

  const toggleFavorite = async (bookId: string) => {
    const isFav = favoriteIds.includes(bookId);
    const newFavs = isFav
      ? favoriteIds.filter((id) => id !== bookId)
      : [...favoriteIds, bookId];
    setFavoriteIds(newFavs);

    await fetch(`${BACKEND_URL}/books/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: bookId, is_favorite: !isFav }),
    });
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.activeCategoryButton,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.activeCategoryText,
        ]}
      >
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderBookItem = ({ item }: { item: any }) => {
    const isFavorite = favoriteIds.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => router.push({
          pathname: '/(library)/[bookId]',
          params: { bookId: item.id },
        })}
      >
        <Image
          source={{ uri: `${BACKEND_URL}${item.cover}` }}
          style={styles.bookCover}
          resizeMode="cover"
        />
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={styles.favIcon}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? 'red' : 'gray'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: '#fff' }}
      edges={['left', 'right', 'bottom']}
    >
      <TouchableOpacity onPress={() => router.back()} style={libStyles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#E5911B" />
      </TouchableOpacity>
      <View style={styles.container}>
        <View style={styles.sidebar}>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.header}>
            📘 {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Books
          </Text>
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={renderBookItem}
            contentContainerStyle={styles.bookList}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, flexDirection: 'row',backgroundColor: '#fff',
   },
  sidebar: {
    width: 100,
    backgroundColor: '#f0f0f0',
    paddingTop: 16,
  },
  categoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  activeCategoryButton: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#D1861E',
  },
  categoryText: {
    fontSize: 18,
    color: '#888',
    paddingLeft: 8,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  activeCategoryText: {
    fontWeight: 'bold',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  header: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  bookList: {
    paddingBottom: 80,
  },
  bookCard: {
    width: (width - 140) / 2,
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 6,
    position: 'relative',
  },
  bookCover: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  bookTitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
    color:'#E5911B',
  },
  favIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
});