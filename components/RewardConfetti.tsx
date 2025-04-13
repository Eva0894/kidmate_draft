import React, { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { View, StyleSheet } from 'react-native';
import confettiAnimation from '../assets/lottie/confetti.json';


export default function RewardConfetti({ visible }: { visible: boolean }) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      animationRef.current?.play();
    } else {
      animationRef.current?.reset();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
        <LottieView
            ref={animationRef}
            source={confettiAnimation}
            autoPlay={false}
            loop={false}
            style={styles.animation}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  animation: {
    width: 300,
    height: 300,
  },
});
