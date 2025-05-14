import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Image, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import libStyles from './libStyles';
import { getBackendUrl } from '@/utils/api'; 

// const BACKEND_URL =
//   Platform.OS === 'ios'
//     ? 'http://localhost:8000' 
//     : 'http://192.168.10.117:8000';
const BACKEND_URL = getBackendUrl();

type Bookmark = { book_id: string; page_index: number };
type Book = { id: string; title: string; cover?: string };

export default function BookmarksScreen() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BACKEND_URL}/books/bookmarks`).then(res => res.json()),
      fetch(`${BACKEND_URL}/books`).then(res => res.json()),
    ])
      .then(([bookmarkData, bookData]) => {
        setBookmarks(bookmarkData);
        setBooks(bookData);
      })
      .catch(err => {
        console.error('❌ Failed to load bookmarks:', err);
        Alert.alert('Error', 'Unable to load bookmarks.');
      })
      .finally(() => setLoading(false));
  }, []);

  const getBookInfo = (id: string) => books.find(b => b.id === id);

  const handleDelete = async (bookId: string, pageIndex: number) => {
    try {
      await fetch(`${BACKEND_URL}/books/bookmarks/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: bookId, page_index: pageIndex }),
      });
      setBookmarks(prev => prev.filter(b => !(b.book_id === bookId && b.page_index === pageIndex)));
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
          <Image
            source={{ uri: `${BACKEND_URL}${book.cover}` }}
            style={styles.cover}
          />
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
        <TouchableOpacity onPress={() => router.push('/library')} style={libStyles.backButton}>
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
      android: 'monospace',}),
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
      android: 'monospace',}),
  },
  pageText: {
    fontSize: 12,
    color: '#555',
  },
});
