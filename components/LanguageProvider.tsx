// LanguageProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/utils/i18n';
import * as Localization from 'expo-localization';

interface LanguageContextProps {
  lang: string;
  setLang: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const storedLang = await AsyncStorage.getItem('APP_LANGUAGE');
      const defaultLang = storedLang || 'en';
      i18n.locale = defaultLang;
      setLang(defaultLang);
    })();
  }, []);

  if (!lang) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};