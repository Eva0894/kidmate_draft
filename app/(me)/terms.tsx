import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import meStyles from './meStyles';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/components/LanguageProvider';
import { useT } from '@/utils/useT';

export default function TermsOfServicePage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { lang, setLang } = useLanguage();
  const changeLanguage = async (newLang: string) => {
    await i18n.changeLanguage(newLang);
    setLang(newLang);
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#fff8ee' }}>
        <TouchableOpacity style={meStyles.backButton} onPress={() => router.replace('/(tabs)/me')}>
            <Ionicons name="arrow-back" size={32} color="#E5911B" />
        </TouchableOpacity>
        <ScrollView style={meStyles.container}>
        <Text style={meStyles.header}>Terms of Service</Text>

        <Text style={meStyles.sectionTitle}>1. Acceptance of Terms</Text>
        <View style={meStyles.listBox}>
            <Text style={meStyles.content}>
                By using our AI Learning Companion App, you agree to be bound by these Terms of Service. If you do not agree, please do not use the App.
            </Text>
        </View>

        <Text style={meStyles.sectionTitle}>2. Use of Service</Text>
        <View style={meStyles.listBox}>
            <Text style={meStyles.content}>
                You must be at least 13 years old to use this app. You agree to use the app only for lawful purposes and in accordance with these Terms.
            </Text>
        </View>

        <Text style={meStyles.sectionTitle}>3. User Accounts</Text>
        <View style={meStyles.listBox}>
            <Text style={meStyles.content}>
                You are responsible for maintaining the confidentiality of your account and any activity that occurs under it.
            </Text>
        </View>
        <Text style={meStyles.sectionTitle}>4. Intellectual Property</Text>
        <View style={meStyles.listBox}>
            <Text style={meStyles.content}>
                All content, features, and functionality in the app are the property of the developers and are protected by copyright laws.
            </Text>
        </View>

        <Text style={meStyles.sectionTitle}>5. Termination</Text>
        <View style={meStyles.listBox}>
            <Text style={meStyles.content}>
                We may suspend or terminate your access to the app at any time, without notice or liability, for any reason.
            </Text>
        </View>

        <Text style={meStyles.sectionTitle}>6. Changes to Terms</Text>
        <View style={meStyles.listBox}>
            <Text style={meStyles.content}>
                We may update these Terms of Service at any time. Continued use of the app constitutes your acceptance of the new terms.
            </Text>
        </View>

        <Text style={meStyles.sectionTitle}>7. Contact Us</Text>
        <View style={meStyles.listBox}>
            <Text style={meStyles.content}>
                If you have any questions about these terms, please contact us at: support@ailearningapp.com
            </Text>
        </View>
        </ScrollView>
    </View>
  );
};