import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';

  const themeStyles = {
    bg: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#F8FAFC' : '#0F172A',
    card: isDark ? '#111111' : '#F1F5F9',
    borderColor: isDark ? '#222222' : '#E2E8F0',
    subText: isDark ? '#64748B' : '#475569',
    btnBg: isDark ? '#1A1A1A' : '#F8FAFC',
  };

  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing or using Sudarshan Vault, you agree to be bound by these Terms of Service. If you do not agree, do not use the application."
    },
    {
      title: "User Responsibility",
      content: "You are solely responsible for the security of your device and the backup of your authentication keys. Since Sudarshan Vault does not store your data in the cloud, loss of your device or loss of your local backup file may result in permanent loss of access to your MFA-protected accounts."
    },
    {
      title: "No Warranty",
      content: "Sudarshan Vault is provided 'as is' without warranties of any kind. We do not guarantee that the application will be error-free or uninterrupted."
    },
    {
      title: "Limitation of Liability",
      content: "In no event shall the developers of Sudarshan Vault be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the application."
    }
  ];

  return (
    <View style={[styles.base, { backgroundColor: themeStyles.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: themeStyles.btnBg }]}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={themeStyles.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: themeStyles.text }]}>Terms of Service</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
             <MaterialCommunityIcons name="file-document-outline" size={48} color="#6366f1" />
             <Text style={[styles.title, { color: themeStyles.text }]}>Usage Guidelines</Text>
             <Text style={[styles.lastUpdated, { color: themeStyles.subText }]}>Last Revised: April 2026</Text>
          </View>

          {sections.map((section, idx) => (
            <View key={idx} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>{section.title}</Text>
              <Text style={[styles.sectionContent, { color: themeStyles.subText }]}>{section.content}</Text>
            </View>
          ))}
          
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: themeStyles.subText }]}>
              Thank you for trusting Sudarshan Vault with your security.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { padding: 24 },
  intro: { alignItems: 'center', marginBottom: 40, gap: 12 },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  lastUpdated: { fontSize: 13, fontWeight: '600' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  sectionContent: { fontSize: 15, lineHeight: 24, fontWeight: '500' },
  footer: { marginTop: 20, paddingBottom: 40, alignItems: 'center' },
  footerText: { fontSize: 13, textAlign: 'center', fontWeight: '500' },
});
