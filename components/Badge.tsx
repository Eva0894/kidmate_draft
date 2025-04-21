import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeProps = {
  text: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
};

export default function Badge({ text, variant = 'default', size = 'md' }: BadgeProps) {
  const getBadgeStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '#E2E8F0',
          textColor: '#475569',
        };
      case 'destructive':
        return {
          backgroundColor: '#F43F5E',
          textColor: '#FFFFFF',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: '#64748B',
          borderWidth: 1,
          borderColor: '#CBD5E1',
        };
      case 'disabled':
        return {
          backgroundColor: '#F1F5F9',
          textColor: '#94A3B8',
        };
      default:
        return {
          backgroundColor: '#FF6B6B',
          textColor: '#FFFFFF',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: 8,
          paddingVertical: 1,
          fontSize: 10,
        };
      case 'lg':
        return {
          paddingHorizontal: 12,
          paddingVertical: 3,
          fontSize: 14,
        };
      default: // 'md'
        return {
          paddingHorizontal: 10,
          paddingVertical: 2,
          fontSize: 12,
        };
    }
  };

  const badgeStyle = getBadgeStyles();
  const sizeStyle = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeStyle.backgroundColor,
          borderWidth: badgeStyle.borderWidth || 0,
          borderColor: badgeStyle.borderColor || 'transparent',
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        },
      ]}
    >
      <Text 
        style={[
          styles.text, 
          { 
            color: badgeStyle.textColor,
            fontSize: sizeStyle.fontSize,
          }
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
  },
  text: {
    fontWeight: '500',
  },
});