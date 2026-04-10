import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ScrollView, StatusBar, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setPrivacyEnabled, setTheme } from '../store/slices/settingsSlice';

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { privacyEnabled, theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';

  const onTogglePrivacy = (val: boolean) => {
    dispatch(setPrivacyEnabled(val));
  };

  const onToggleTheme = (val: boolean) => {
    dispatch(setTheme(val ? 'dark' : 'light'));
  };

  const dynamicStyles = {
    bg: isDark ? '#000' : '#FFFFFF',
    text: isDark ? '#F8FAFC' : '#0F172A',
    card: isDark ? 'rgba(30, 41, 59, 0.4)' : '#F1F5F9',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    subText: isDark ? '#64748B' : '#475569',
  };

  return (
    <View style={[styles.base, { backgroundColor: dynamicStyles.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={dynamicStyles.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: dynamicStyles.text }]}>Settings</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            <View style={[styles.card, { backgroundColor: dynamicStyles.card, borderColor: dynamicStyles.borderColor }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                    <MaterialCommunityIcons name="shield-lock-outline" size={24} color="#6366f1" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.settingLabel, { color: dynamicStyles.text }]}>Privacy Lock</Text>
                    <Text style={[styles.settingDesc, { color: dynamicStyles.subText }]}>Require biometrics or passcode to open the vault</Text>
                  </View>
                </View>
                <Switch
                  value={privacyEnabled}
                  onValueChange={onTogglePrivacy}
                  trackColor={{ false: '#94A3B8', true: '#6366f1' }}
                  thumbColor={privacyEnabled ? '#FFF' : '#F1F5F9'}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <View style={[styles.card, { backgroundColor: dynamicStyles.card, borderColor: dynamicStyles.borderColor }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(30, 41, 59, 0.5)' }]}>
                    <MaterialCommunityIcons name="theme-light-dark" size={24} color={isDark ? "#F1F5F9" : "#64748B"} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.settingLabel, { color: dynamicStyles.text }]}>Black Theme</Text>
                    <Text style={[styles.settingDesc, { color: dynamicStyles.subText }]}>Optimized for OLED displays</Text>
                  </View>
                </View>
                <Switch 
                  value={isDark} 
                  onValueChange={onToggleTheme}
                  trackColor={{ false: '#94A3B8', true: '#6366f1' }}
                  thumbColor={isDark ? '#FFF' : '#F1F5F9'}
                />
              </View>
            </View>
          </View>


          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(30, 41, 59, 0.5)' }]}>
                    <MaterialCommunityIcons name="information-outline" size={24} color="#94A3B8" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.settingLabel}>Version</Text>
                    <Text style={styles.settingDesc}>v1.0.0 Alpha</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <MaterialCommunityIcons name="shield-check" size={48} color="rgba(99, 102, 241, 0.2)" />
            <Text style={styles.footerText}>
              Sudarshan Vault uses industry-standard encryption to protect your data. All keys are stored locally and never leave your device.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  settingLabel: {
    color: '#F1F5F9',
    fontSize: 17,
    fontWeight: '700',
  },
  settingDesc: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 20,
  },
  footerText: {
    color: '#334155',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  }
});
