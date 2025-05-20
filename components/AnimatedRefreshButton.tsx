import React, { useRef } from 'react';
import { Animated, Easing, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AnimatedRefreshButtonProps = {
    onRefresh?: () => void;
  };

  export default function AnimatedRefreshButton({ onRefresh }: AnimatedRefreshButtonProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startRotation = () => {
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      onRefresh && onRefresh();
    });
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity onPress={startRotation} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <Ionicons name="refresh" size={24} />
      </Animated.View>
    </TouchableOpacity>
  );
}