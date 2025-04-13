import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const categories = [
  {
    title: 'Reading',
    description: 'Basics of reading starting with the ABCs.',
    image: require('../../assets/images/game.jpg'),//change
    url: 'https://www.starfall.com/h/'
  },
  {
    title: 'Math',
    description: 'Learn counting, shapes, addition and subtraction while having fun.',
    image: require('../../assets/images/game.jpg'),//change
    url: 'https://www.funbrain.com/pre-k'
  },
  {
    title: 'Shape and Color',
    description: 'Recognize colors and shapes.',
    image: require('../../assets/images/game.jpg'),//change
    url: 'https://pbskids.org/games/shapes/'
  },
  {
    title: 'Language',
    description: 'Learn basic words and spelling.',
    image: require('../../assets/images/game.jpg'),//change
    url: 'https://learn.khanacademy.org/khan-academy-kids/'
  },
];

export default function EarlyLearningPage() {
  const navigation = useNavigation();

  return (
    
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Enlightenment Courses</Text>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← back</Text>
      </TouchableOpacity>
      {categories.map((cat, index) => (
        <TouchableOpacity key={index} style={styles.card} onPress={() => Linking.openURL(cat.url)}>
          <Image source={cat.image} style={styles.image} />
          <View style={styles.textWrap}>
            <Text style={styles.title}>{cat.title}</Text>
            <Text style={styles.description}>{cat.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 50,
  },
  header: {
    fontSize: 28,
    color: '#ffcc00',
    marginTop: 80,
    marginBottom: 20,
    fontWeight: '800',
    fontFamily: 'Cochin',
    textShadowColor: '#444',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF6E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    color: 'skyblue',
    marginTop: 20,
    marginBottom: 20,
    fontWeight: '800',
    fontFamily: 'cin',
    textShadowColor: '#444',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 18,
    color: '#ccc',
    marginTop: 4,

  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#444',
    borderRadius: 8,
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: '#e2ac30',
    fontWeight: 'bold',
  },
});