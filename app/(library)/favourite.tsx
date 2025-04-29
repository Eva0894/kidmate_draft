// favorites.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import libStyles from './libStyles';


// 根据平台设置 API 地址
const BACKEND_URL =
Platform.OS === 'ios'
  ? 'http://localhost:8000'
  : 'http://10.0.2.2:8000';

console.log('Using API URL:', BACKEND_URL);

const { width } = Dimensions.get('window');

type Book = { id: number; title: string; cover?: string };

export default function FavoritesScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/books`)
      .then(res => res.json())
      .then(setBooks)
      .catch(console.error);

    fetch(`${BACKEND_URL}/books/favorites`)
      .then(res => res.json())
      .then(setFavoriteIds)
      .catch(console.error);
  }, []);

  const favoriteBooks = books.filter((book) => favoriteIds.includes(book.id));

  const removeFromFavorites = async (bookId: number) => {
    try {
      await fetch(`${BACKEND_URL}/books/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: bookId, is_favorite: false }),
      });
      setFavoriteIds((prev) => prev.filter((id) => id !== bookId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={libStyles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>
        <Text style={styles.header}>❤️ My Favorites</Text>
        <FlatList
          data={favoriteBooks}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.bookList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookCard}
              onPress={() =>
                router.push({
                  pathname: '/bookId' as const,
                  params: { id: String(item.id), page: '0' },
                })
              }
              onLongPress={() =>
                Alert.alert(
                  'Remove from Favorites',
                  `Are you sure you want to remove "${item.title}" from favorites?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: () => removeFromFavorites(item.id),
                    },
                  ]
                )
              }
            >
              <Image
                source={{ uri: `${BACKEND_URL}${item.cover}` }}
                style={styles.bookCover}
              />
              <Text style={styles.bookTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  header: {
    paddingVertical: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
    textAlign:'center',
  },
  bookList: { paddingBottom: 80 },
  bookCard: {
    width: (width - 48) / 2,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 6,
  },
  bookCover: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  bookTitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
    color:'#E5911B'
  },
});
