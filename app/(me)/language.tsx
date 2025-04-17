// language.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/components/LanguageProvider';

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('language')}</Text>
      </View>

      <TouchableOpacity style={styles.option} onPress={() => changeLanguage('en')}>
        <Text style={styles.optionText}>{t('english')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => changeLanguage('zh')}>
        <Text style={styles.optionText}>{t('chinese')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 12 },
  option: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  optionText: { fontSize: 16 },
});

export default LanguagePage;
