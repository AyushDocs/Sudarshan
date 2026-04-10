import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, StatusBar, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
const { cacheDirectory, writeAsStringAsync, readAsStringAsync } = FileSystem;
import * as Sharing from 'expo-sharing';
import { importAccounts } from '../store/slices/authSlice';

export default function BackupsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const accounts = useSelector((state: RootState) => state.auth.accounts);
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

  const handleExport = async () => {
    try {
      const data = JSON.stringify(accounts, null, 2);
      const filename = `sudarshan_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = cacheDirectory + filename;
      
      await writeAsStringAsync(fileUri, data);
      await Sharing.shareAsync(fileUri);
    } catch (e) {
      Alert.alert("Export Failed", "Could not create backup file.");
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled) return;

      const content = await readAsStringAsync(result.assets[0].uri);
      const imported = JSON.parse(content);
      
      if (Array.isArray(imported)) {
        dispatch(importAccounts(imported));
        Alert.alert("Success", `${imported.length} accounts imported successfully.`);
      }
    } catch (e) {
      Alert.alert("Import Failed", "Invalid backup file format.");
    }
  };

  return (
    <View style={[styles.base, { backgroundColor: themeStyles.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: themeStyles.btnBg }]}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={themeStyles.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: themeStyles.text }]}>Key Backups</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.infoCard, { backgroundColor: isDark ? '#1A1A1A' : '#F0F9FF', borderColor: isDark ? '#333' : '#BAE6FD' }]}>
            <MaterialCommunityIcons name="shield-check" size={32} color="#0284c7" />
            <Text style={[styles.infoTitle, { color: isDark ? '#F8FAFC' : '#0369a1' }]}>Secure Local Backups</Text>
            <Text style={[styles.infoDesc, { color: isDark ? '#94A3B8' : '#075985' }]}>
              Your keys are never synced to the cloud. We recommend exporting a backup file to a secure location (like an encrypted USB drive) regularly.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={[styles.actionCard, { backgroundColor: themeStyles.card, borderColor: themeStyles.borderColor }]}>
              <Pressable style={styles.actionRow} onPress={handleExport}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <MaterialCommunityIcons name="export-variant" size={24} color="#10b981" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.actionLabel, { color: themeStyles.text }]}>Export Vault</Text>
                  <Text style={[styles.actionDesc, { color: themeStyles.subText }]}>Save all keys to a JSON file</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={themeStyles.subText} />
              </Pressable>

              <View style={[styles.divider, { backgroundColor: themeStyles.borderColor }]} />

              <Pressable style={styles.actionRow} onPress={handleImport}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                  <MaterialCommunityIcons name="import" size={24} color="#6366f1" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.actionLabel, { color: themeStyles.text }]}>Import Vault</Text>
                  <Text style={[styles.actionDesc, { color: themeStyles.subText }]}>Restore keys from a backup file</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={themeStyles.subText} />
              </Pressable>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: themeStyles.card, borderColor: themeStyles.borderColor }]}>
              <Text style={[styles.statValue, { color: themeStyles.text }]}>{accounts.length}</Text>
              <Text style={[styles.statLabel, { color: themeStyles.subText }]}>Total Keys</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: themeStyles.card, borderColor: themeStyles.borderColor }]}>
              <Text style={[styles.statValue, { color: themeStyles.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: themeStyles.subText }]}>Manual Entries</Text>
            </View>
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
  infoCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
    gap: 12,
  },
  infoTitle: { fontSize: 18, fontWeight: '800' },
  infoDesc: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  section: { marginBottom: 32 },
  actionCard: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: { flex: 1 },
  actionLabel: { fontSize: 16, fontWeight: '700' },
  actionDesc: { fontSize: 13, marginTop: 2, fontWeight: '500' },
  divider: { height: 1 },
  statsContainer: { flexDirection: 'row', gap: 16 },
  statBox: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
