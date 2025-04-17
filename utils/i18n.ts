// utils/i18n.ts
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

const i18n = new I18n({
  en: {
    welcome: 'Welcome',
    chooseLanguage: 'Select your preferred language',
    english: 'English',
    chinese: 'Chinese',
    back: 'Back',
  },
  zh: {
    welcome: '欢迎',
    chooseLanguage: '选择您需要的语言',
    english: '英文',
    chinese: '中文',
    back: '返回',
  },
});

// 默认根据设备语言设置
i18n.locale = Localization.locale;
i18n.enableFallback = true;

export const setAppLanguage = async (lang: string) => {
  await AsyncStorage.setItem('APP_LANGUAGE', lang);
  i18n.locale = lang;
};

export const getAppLanguage = async (): Promise<string> => {
    const lang = await AsyncStorage.getItem('APP_LANGUAGE');
    const selected = lang || 'en'; 
    i18n.locale = selected;
    return selected;
  };

export default i18n;
