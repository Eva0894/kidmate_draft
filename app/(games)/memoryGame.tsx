import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
//  import RewardConfetti from '@/components/RewardConfetti';

const CARD_PAIRS = ['🃏', '🍎', '🐶', '⭐️'];
const screenWidth = Dimensions.get('window').width;
const CARD_SIZE = (screenWidth - 60) / 4;
// const [showConfetti, setShowConfetti] = useState(false);

type Card = {
  id: number;
  icon: string;
  matched: boolean;
};

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const shuffled = shuffleCards();
    setCards(shuffled);
  }, []);

  const shuffleCards = (): Card[] => {
    const duplicated = [...CARD_PAIRS, ...CARD_PAIRS];
    const shuffled = duplicated
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        matched: false,
      }));
    return shuffled;
  };

  const handlePress = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].matched || flippedIndices.includes(index)) return;

    const newFlips = [...flippedIndices, index];
    setFlippedIndices(newFlips);

    if (newFlips.length === 2) {
      const [first, second] = newFlips;
      if (cards[first].icon === cards[second].icon) {
        const updated = [...cards];
        updated[first].matched = true;
        updated[second].matched = true;
        setTimeout(() => {
          setCards(updated);
          setFlippedIndices([]);
          if (updated.every((c) => c.matched)) {
            Alert.alert('🎉 Great Job!', 'You matched all the cards!');
            // setShowConfetti(true);
          }
        }, 600);
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
        }, 800);
        // setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  };

  const renderCard = (card: Card, index: number) => {
    const isFlipped = flippedIndices.includes(index) || card.matched;
    return (
      <TouchableOpacity
        key={card.id}
        style={[styles.card, isFlipped && styles.flippedCard]}
        onPress={() => handlePress(index)}
        activeOpacity={0.8}
      >
        <Text style={styles.cardText}>{isFlipped ? card.icon : '❓'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Memory Match</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.grid}>
        {cards.map((card, index) => renderCard(card, index))}
      </View>
      {/* <RewardConfetti visible={showConfetti} /> */}
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  header: {
    height: 60,
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 16,
    color: '#e2ac30',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
  },
  grid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    marginBottom: 12,
    backgroundColor: '#eee',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flippedCard: {
    backgroundColor: '#ffeb99',
  },
  cardText: {
    fontSize: 28,
  },
});
