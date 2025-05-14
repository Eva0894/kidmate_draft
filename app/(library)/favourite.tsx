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
import { getBackendUrl } from '@/utils/api'; 

const BACKEND_URL = getBackendUrl();

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
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/library')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>
        <Text style={styles.header}>❤️ My Favorites</Text>
      </View>
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
                  pathname: '/[bookId]' as const,
                  params: { bookId: String(item.id), page: '0' },
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
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 8,
    paddingHorizontal: 16,

  },
  header: {
    flex:1,  
    paddingTop: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
    textAlign:'center',
  },
  backButton: {
    position: 'absolute',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 1,
    left: 16,
    zIndex: 10,
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
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
    color:'#E5911B'
  },
});
