import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  PanResponder,
  Animated,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';

const puzzleSize = 50;
const tolerance = 10;

const CaptchaSlider = ({ onSuccess }: { onSuccess: () => void }) => {
  const [targetX] = useState(Math.floor(Math.random() * 100) + 100); // Gap position
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        const distance = Math.abs(gesture.dx - targetX);
        if (distance < tolerance) {
          Alert.alert('Verification Successful', 'You passed the human verification');
          onSuccess();
        } else {
          Alert.alert('Verification Failed', 'Please try again');
          pan.setValue({ x: 0, y: 0 });
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Text style={styles.tip}>Please drag the puzzle piece to complete verification</Text>
      <View style={styles.imageContainer}>
        {/* Background image */}
        <Image
          source={require('@/assets/slider_bg.jpg')}
          style={styles.image}
        />

        {/* Gap mask */}
        <View
          style={[
            styles.cutout,
            {
              left: targetX,
            },
          ]}
        />

        {/* Puzzle piece */}
        <Animated.Image
          source={require('@/assets/puzzle_piece.png')}
          style={[
            styles.puzzle,
            {
              transform: [{ translateX: pan.x }],
              top: 30,
            },
          ]}
          {...panResponder.panHandlers}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    alignItems: 'center',
  },
  tip: {
    fontSize: 16,
    marginBottom: 10,
  },
  imageContainer: {
    width: 300,
    height: 150,
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cutout: {
    position: 'absolute',
    width: puzzleSize,
    height: puzzleSize,
    backgroundColor: '#ccc',
    opacity: 0.6,
    top: 30,
    borderRadius: 6,
  },
  puzzle: {
    position: 'absolute',
    width: puzzleSize,
    height: puzzleSize,
    borderRadius: 6,
    zIndex: 10,
  },
});

export default CaptchaSlider;