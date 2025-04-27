// language.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/components/LanguageProvider';
import meStyles from './meStyles'; 

const LanguagePage = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { lang, setLang } = useLanguage();

  const changeLanguage = async (newLang: string) => {
    await i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={meStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={32} color="#E5911B" />
        </TouchableOpacity>
        <Text style={meStyles.header}>{t('language')}</Text>
      </View>

      <TouchableOpacity style={styles.option} onPress={() => changeLanguage('en')}>
        <Text style={styles.optionText}>{t('English')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => changeLanguage('zh')}>
        <Text style={styles.optionText}>{t('Chinese')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, fontFamily: 'ChalkboardSE-Regular' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, fontFamily: 'ChalkboardSE-Regular'},
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 12, fontFamily: 'ChalkboardSE-Regular'},
  option: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ccc', fontFamily: 'ChalkboardSE-Regular' },
  optionText: { fontSize: 16, fontFamily: 'ChalkboardSE-Regular' },
});

export default LanguagePage;
