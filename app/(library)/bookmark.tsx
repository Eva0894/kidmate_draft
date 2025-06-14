import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import libStyles from './libStyles';
import { supabase } from '@/utils/Supabase';
import { getBookBackendUrl } from '@/utils/apiConfig';

const BACKEND_URL = getBookBackendUrl();

type Bookmark = { book_id: string; page_index: number };
type Book = { id: string; title: string; cover?: string };

export default function BookmarksScreen() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      try {
        const [bookmarkRes, bookRes] = await Promise.all([
          fetch(`${BACKEND_URL}/books/bookmarks?user_id=${userId}`),
          fetch(`${BACKEND_URL}/books`),
        ]);

        if (!bookmarkRes.ok || !bookRes.ok) {
          const errorText = await bookmarkRes.text();
          console.error('❌ 请求书签或图书失败:', errorText);
          Alert.alert('Error', 'Failed to fetch data.');
          return;
        }

        const [bookmarkData, bookData] = await Promise.all([
          bookmarkRes.json(),
          bookRes.json(),
        ]);

        setBookmarks(Array.isArray(bookmarkData) ? bookmarkData : []);
        setBooks(Array.isArray(bookData) ? bookData : []);
      } catch (err) {
        console.error('❌ Failed to load bookmarks:', err);
        Alert.alert('Error', 'Unable to load bookmarks.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const getBookInfo = (id: string) => books.find((b) => b.id === id);

  const handleDelete = async (bookId: string, pageIndex: number) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    try {
      await fetch(`${BACKEND_URL}/books/bookmarks/delete?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: bookId, page_index: pageIndex }),
      });
      setBookmarks((prev) =>
        prev.filter((b) => !(b.book_id === bookId && b.page_index === pageIndex))
      );
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
      Alert.alert('Error', 'Failed to delete bookmark.');
    }
  };

  const renderItem = ({ item }: { item: Bookmark }) => {
    const book = getBookInfo(item.book_id);
    if (!book) return null;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          router.push({
            pathname: '/(library)/[bookId]',
            params: { bookId: item.book_id, page: String(item.page_index) },
          })
        }
        onLongPress={() =>
          Alert.alert('Delete Bookmark', 'Are you sure you want to delete this bookmark?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => handleDelete(item.book_id, item.page_index),
            },
          ])
        }
      >
        {book.cover && (
          <Image source={{ uri: `${BACKEND_URL}${book.cover}` }} style={styles.cover} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.itemText} numberOfLines={1}>
            {book.title || 'Unknown Book'}
          </Text>
          <Text style={styles.pageText}>Page {item.page_index + 1}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={libStyles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>
        <Text style={styles.header}>🔖 My Bookmarks</Text>
      </View>

      {loading ? (
        <Text style={styles.statusText}>Loading...</Text>
      ) : bookmarks.length === 0 ? (
        <Text style={styles.statusText}>No bookmarks found.</Text>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item, index) => `${item.book_id}-${item.page_index}-${index}`}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  header: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',
    }),
  },
  statusText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    marginBottom: 10,
  },
  cover: {
    width: 50,
    height: 70,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#ddd',
  },
  itemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',
    }),
  },
  pageText: {
    fontSize: 12,
    color: '#555',
  },
});
