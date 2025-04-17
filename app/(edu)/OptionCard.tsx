import React from 'react';
import { Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

type OptionCardProps = {
  title: string;
  image: any;
  onPress?: () => void;
};

const OptionCard: React.FC<OptionCardProps> = ({ title, image, onPress }) => (
  <TouchableOpacity style={styles.optionCard} onPress={onPress}>
    <Image source={image} style={styles.optionImage} />
    <Text style={styles.optionText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  optionCard: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  optionImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  optionText: {
    marginTop: 6,
    color: '#e2ac30',
    fontWeight: '600',
  },
});

export default OptionCard;
