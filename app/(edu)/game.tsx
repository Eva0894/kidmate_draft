import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { router, type Href } from 'expo-router';
import eduStyles from './eduStyles';

const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = (screenWidth - 48) / 2;

const games = [
  {
    title: '🎴 Memory Match',
    image: require('../../assets/images/game.jpg'),
    route: '/(games)/memoryGame',
  },
  {
    title: '🎨 Color Sort',
    image: require('../../assets/images/game.jpg'),
    route: '/(games)/colorSort',
  },
  {
    title: '🧩 Shape Match',
    image: require('../../assets/images/game.jpg'),
    route: '/(games)/shapeMatch',
  },
  {
    title: '🔢 Number Tap',
    image: require('../../assets/images/game.jpg'),
    route: '/(games)/numberGame',
  },
];

export default function GamePage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
        <Text style={eduStyles.header}>Game Center</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => (router.back())}>
            <Text style={styles.backText}>← back</Text>
        </TouchableOpacity>

        <FlatList
            data={games}
            numColumns={2}
            keyExtractor={(item) => item.title}
            contentContainerStyle={{ paddingBottom: 40 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(item.route as Href)}

            >
                <Image source={item.image} style={styles.image} />
                <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
            )}
        />
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  backButton: {
    position: 'absolute',
    top: 30,
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
