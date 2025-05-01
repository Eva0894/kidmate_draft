// app/(library)/bookmarks.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ScrollView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import libStyles from './libStyles';
import { BASE_URL, post } from '@/utils/api';

// 根据平台设置 API 地址
const BACKEND_URL =
Platform.OS === 'ios'
  ? BASE_URL
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
      <View style={styles.headerContainer}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={28} color="#E5911B" />
         </TouchableOpacity>
         <Text style={styles.header}>🔖 My Bookmarks</Text>
  </View>
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
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16, 
    marginBottom: 16,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
    textAlign:'center',
  },
  item: {
    padding: 14,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 14,
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
  },
});
