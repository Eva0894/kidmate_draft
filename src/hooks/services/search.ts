import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BACKEND_URL = 'http://localhost:8000'; 
const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const [books, setBooks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  // 获取图书数据
  useEffect(() => {
    fetch(`${BACKEND_URL}/book`)
      .then((res) => res.json())
      .then(setBooks)
      .catch(console.error);
  }, []);

  // 过滤搜索内容（忽略大小写）
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => router.push(`/book/${item.id}`)}
    >
      <Image
        source={{
          uri: item.cover?.startsWith('http')
            ? item.cover
            : `${BACKEND_URL}${item.cover}`
        }}
        style={styles.bookCover}
      />
      <Text style={styles.bookTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Search Books</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#333" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Enter book title..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.booksList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  headerRow: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  booksList: {
    paddingBottom: 60,
  },
  bookCard: {
    width: (width - 48) / 3,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 4,
  },
  bookCover: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  bookTitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
