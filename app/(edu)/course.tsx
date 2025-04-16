import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const categories = [
  {
    title: 'Art',
    image: require('../../assets/images/art.png'),
  },
  {
    title: 'Sport',
    image: require('../../assets/images/sport.png'),
  },
  {
    title: 'Emotion',
    image: require('../../assets/images/art.png'),
  },
];

const recentBooks = [
  {
    title: "Alex's Super Medicine",
    image: require('../../assets/images/art.png'),
    progress: 0.8,
  },
  {
    title: 'Brave Bora',
    image: require('../../assets/images/art.png'),
    progress: 1,
    favorite: true,
  },
  {
    title: "Sam's Treasures",
    image: require('../../assets/images/art.png'),
    progress: 0.6,
  },
];

export default function CoursePage() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle" size={36} color="#DDAA00" />
        <Text style={styles.timer}>30mins</Text>
        <Ionicons name="search" size={24} color="#DDAA00" style={styles.icon} />
        <MaterialCommunityIcons name="cube-outline" size={24} color="#DDAA00" style={styles.icon} />
      </View>

      <Text style={styles.sectionTitle}>Course</Text>
      <Image
        source={require('../../assets/images/banner.png')}
        style={styles.banner}
        resizeMode="cover"
      />

      <Text style={styles.sectionTitle}>Classification</Text>
      <View style={styles.categoryRow}>
        {categories.map((cat, index) => (
          <View key={index} style={styles.categoryItem}>
            <Image source={cat.image} style={styles.categoryImage} />
            <Text style={styles.categoryTitle}>{cat.title}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recent</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recentBooks.map((book, index) => (
          <View key={index} style={styles.bookItem}>
            <Image source={book.image} style={styles.bookImage} />
            <Text style={styles.bookTitle}>{book.title}</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${book.progress * 100}%` }]} />
            </View>
            {book.favorite && <Ionicons name="star" size={18} color="#f9c400" style={styles.starIcon} />}
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  icon: {
    marginHorizontal: 8,
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#D38300',
  },
  banner: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryItem: {
    alignItems: 'center',
    width: '30%',
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  categoryTitle: {
    marginTop: 6,
    fontWeight: '600',
    color: '#a66f00',
  },
  bookItem: {
    width: 120,
    marginRight: 16,
    alignItems: 'center',
  },
  bookImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  bookTitle: {
    marginTop: 4,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    width: '100%',
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#d28c00',
    borderRadius: 3,
  },
  starIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
