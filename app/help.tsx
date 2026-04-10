import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, StatusBar, LayoutAnimation, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface FAQItemProps {
  question: string;
  answer: string;
  themeStyles: any;
}

const FAQItem = ({ question, answer, themeStyles }: FAQItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.faqCard, { backgroundColor: themeStyles.card, borderColor: themeStyles.borderColor }]}>
      <Pressable onPress={toggle} style={styles.faqHeader}>
        <Text style={[styles.question, { color: themeStyles.text }]}>{question}</Text>
        <MaterialCommunityIcons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={24} 
          color={themeStyles.subText} 
        />
      </Pressable>
      {expanded && (
        <View style={styles.answerContainer}>
          <Text style={[styles.answer, { color: themeStyles.subText }]}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function HelpScreen() {
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

  const faqs = [
    {
      question: "What is Sudarshan Vault?",
      answer: "Sudarshan Vault is a high-security MFA (Multi-Factor Authentication) application designed to protect your accounts using time-based and counter-based one-time passwords."
    },
    {
      question: "Where is my data stored?",
      answer: "All your authentication data is stored locally on your device in an encrypted form. We do not use any cloud servers to store or sync your keys, ensuring maximum privacy."
    },
    {
      question: "How do I backup my keys?",
      answer: "You can create a local backup from the 'Key Backups' section. This allows you to export your data to a JSON file which you should keep in a safe, offline location."
    },
    {
      question: "What if I lose my phone?",
      answer: "Since we do not sync to the cloud, you can only recover your keys if you have a backup file. Always ensure you have a recent backup stored securely."
    },
    {
      question: "Is it open source?",
      answer: "Currently, Sudarshan Vault is in a private alpha phase. We prioritize security transparency and regular audits."
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
          <Text style={[styles.headerTitle, { color: themeStyles.text }]}>Help & FAQ</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="help-circle-outline" size={40} color="#6366f1" />
            </View>
            <Text style={[styles.introTitle, { color: themeStyles.text }]}>How can we help?</Text>
            <Text style={[styles.introDesc, { color: themeStyles.subText }]}>
              Find answers to common questions about Sudarshan&apos;s security features and data management.
            </Text>
          </View>

          <View style={styles.faqList}>
            {faqs.map((faq, index) => (
              <FAQItem key={index} {...faq} themeStyles={themeStyles} />
            ))}
          </View>

          <View style={[styles.contactCard, { backgroundColor: isDark ? '#111' : '#F1F5F9' }]}>
            <Text style={[styles.contactTitle, { color: themeStyles.text }]}>Still have questions?</Text>
            <Text style={[styles.contactDesc, { color: themeStyles.subText }]}>
              We&apos;re currently in alpha and value your feedback.
            </Text>
            <Pressable style={styles.contactBtn}>
              <Text style={styles.contactBtnText}>Send Feedback</Text>
            </Pressable>
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
  intro: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  introTitle: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
  introDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
  faqList: { gap: 16, marginBottom: 40 },
  faqCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  question: { flex: 1, fontSize: 16, fontWeight: '700', marginRight: 16 },
  answerContainer: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 0,
  },
  answer: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  contactCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
  },
  contactTitle: { fontSize: 18, fontWeight: '800' },
  contactDesc: { fontSize: 14, textAlign: 'center', marginBottom: 12, fontWeight: '500' },
  contactBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  contactBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
