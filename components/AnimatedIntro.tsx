import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const content = [
  {
    title: "Let's explore.",
    source: require('@/assets/images/intro-bg1.jpg'),
    fontColor: '#FF69B4',
  },
  {
    title: "Let's play!",
    source: require('@/assets/images/intro-bg2.jpg'),
    fontColor: '#00BFFF',
  },
  {
    title: "Let's learn!",
    source: require('@/assets/images/intro-bg3.jpg'),
    fontColor: '#4169E1',
  },
  {
    title: "Let's go!",
    source: require('@/assets/images/intro-bg4.jpg'),
    fontColor: '#00BFFF',
  },
  {
    title: 'KidMate!',
    source: require('@/assets/images/intro-bg5.jpg'),
    fontColor: '#FF69B4',
  },
];

export default function AnimatedIntro() {
  const [index, setIndex] = useState(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const animateIn = () => {
      opacity.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      });
    };

    const animateOut = () => {
      opacity.value = withTiming(0, { duration: 400 });
      translateY.value = withTiming(20, { duration: 400 });
    };

    animateIn();

    const interval = setInterval(() => {
      animateOut();

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % content.length);
        animateIn();
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <ImageBackground
      source={content[index].source}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Animated.Text
          style={[
            styles.title,
            textStyle,
            { color: content[index].fontColor },
          ]}
        >
          {content[index].title}
        </Animated.Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  overlay: {
    marginBottom: 170,
    backgroundColor: 'rgba(232, 168, 17, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'ChalkboardSE-Regular',
    textAlign: 'center',
  },
});