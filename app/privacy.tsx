import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function PrivacyPolicyScreen() {
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
      title: "Data Sovereignty",
      content: "Sudarshan Vault operates on a 'Local-Only' principle. Your cryptographic secrets, account identifiers, and personal settings never leave your device. We do not maintain any cloud databases or synchronization servers."
    },
    {
      title: "Zero Tracking",
      content: "We do not use any analytics, crash reporting, or tracking pixels. Your interaction with the app is entirely private and anonymous."
    },
    {
      title: "Encryption",
      content: "All sensitive data is stored using hardware-backed encryption (keychain/keystore). If you set a Master Password, it is used to derive an encryption key that remains strictly local."
    },
    {
      title: "Third-Party Services",
      content: "The app does not communicate with any third-party services, except for the local cryptographic libraries required to generate your MFA codes."
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
          <Text style={[styles.headerTitle, { color: themeStyles.text }]}>Privacy Policy</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
             <MaterialCommunityIcons name="shield-check" size={48} color="#10b981" />
             <Text style={[styles.title, { color: themeStyles.text }]}>Your Privacy is Absolute</Text>
             <Text style={[styles.lastUpdated, { color: themeStyles.subText }]}>Effective: April 2026</Text>
          </View>

          {sections.map((section, idx) => (
            <View key={idx} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>{section.title}</Text>
              <Text style={[styles.sectionContent, { color: themeStyles.subText }]}>{section.content}</Text>
            </View>
          ))}
          
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: themeStyles.subText }]}>
              By using Sudarshan Vault, you agree to these privacy principles.
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
