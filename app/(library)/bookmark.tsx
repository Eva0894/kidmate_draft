// app/(library)/bookmarks.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ScrollView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import libStyles from './libStyles';

// 根据平台设置 API 地址
const BACKEND_URL =
Platform.OS === 'ios'
  ? 'http://localhost:8000'
  : 'http://10.0.2.2:8000';

console.log('Using API URL:', BACKEND_URL);

// const BACKEND_URL = 'http://127.0.0.1:8000';

export default function BookmarksScreen() {
  const router = useRouter();
  type Bookmark = { book_id: number; page_index: number };
  type Book = { id: number; title: string; author?: string; cover_url?: string };
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/books/bookmarks`)
      .then(res => res.json())
      .then(setBookmarks)
      .catch(console.error);

    fetch(`${BACKEND_URL}/books`)
      .then(res => res.json())
      .then(setBooks)
      .catch(console.error);
  }, []);

  const getBookTitle = (id: number) => {
    const book = books.find(b => b.id === id);
    return book?.title || 'Unknown Book';
  };

  const handleDelete = async (bookId: number, pageIndex: number) => {
    await fetch(`${BACKEND_URL}/books/bookmarks/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: bookId, page_index: pageIndex }),
    });
    setBookmarks(prev => prev.filter(b => !(b.book_id === bookId && b.page_index === pageIndex)));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={libStyles.backButton}>
          <Ionicons name="arrow-back" size={32} color="#E5911B" />
        </TouchableOpacity>
      <Text style={styles.header}>🔖 My Bookmarks</Text>
      <FlatList
        data={bookmarks}
        keyExtractor={(item, index) => `${item.book_id}-${item.page_index}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push({
                pathname: "/bookId" as const,
                params: {
                  id: item.book_id.toString(),
                  page: item.page_index.toString(),
                },
              })
            }
            
            onLongPress={() => {
              Alert.alert(
                'Delete Bookmark',
                'Are you sure you want to delete this bookmark?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDelete(item.book_id, item.page_index),
                  },
                ]
              );
            }}
          >
            <Text style={styles.itemText}>{getBookTitle(item.book_id)} - Page {item.page_index + 1}</Text>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#E5911B',
    fontFamily:'Futura',
    textAlign:'center',
  },
  item: {
    padding: 14,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 18,
    color: '#E5911B',
    fontFamily:'Futura',
  },
});
