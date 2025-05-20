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
import { supabase } from '@/utils/Supabase';
import { getBookBackendUrl } from '@/utils/apiConfig';

const BACKEND_URL = getBookBackendUrl();
const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      try {
        const resBooks = await fetch(`${BACKEND_URL}/books`);
        const bookList = await resBooks.json();
        setBooks(bookList);

        const resFav = await fetch(`${BACKEND_URL}/books/favorites?user_id=${userId}`);
        const favIds = await resFav.json();
        if (Array.isArray(favIds)) {
          setFavoriteIds(favIds);
        } else {
          setFavoriteIds([]);
        }
      } catch (err) {
        console.error('Failed to fetch favorites or books:', err);
        setFavoriteIds([]);
      }
    };

    fetchFavorites();
  }, []);

  const favoriteBooks = books.filter((book) => favoriteIds.includes(book.id));

  const removeFromFavorites = async (bookId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    try {
      await fetch(`${BACKEND_URL}/books/favorite?user_id=${userId}`, {
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
        <TouchableOpacity onPress={() => router.replace('/library')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>
        <Text style={styles.header}>My Favorites</Text>
      </View>

      {favoriteBooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorite books found.</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteBooks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.bookList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookCard}
              onPress={() =>
                router.push({
                  pathname: '/(library)/[bookId]',
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
              <Image source={{ uri: `${BACKEND_URL}${item.cover}` }} style={styles.bookCover} />
              <Text style={styles.bookTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
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
    flex: 1,
    paddingTop: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    fontFamily: Platform.select({ ios: 'ChalkboardSE-Regular', android: 'casual' }),
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    padding: 8,
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
    fontFamily: Platform.select({ ios: 'ChalkboardSE-Regular', android: 'casual' }),
    color: '#E5911B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
