// hooks/useThemedStyles.ts
import { useTheme } from '@/components/ThemeContext';
import { useMemo } from 'react';

export const useThemedColors = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return useMemo(() => ({
    backgroundColor: isDark ? '#000' : '#FDF8EC',
    textColor: isDark ? '#fff' : '#222',
    cardColor: isDark ? '#1c1c1c' : '#fff',
    dividerColor: isDark ? '#333' : '#eee',
  }), [theme]);
};