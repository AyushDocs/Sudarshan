import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { importAccounts } from '../store/slices/authSlice';

const { width } = Dimensions.get('window');

export default function TransferScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const accounts = useSelector((state: RootState) => state.auth.accounts);
  
  const [mode, setMode] = useState<'options' | 'export' | 'import'>('options');
  const [selectedIds, setSelectedIds] = useState<number[]>(accounts.map((a: any) => a.id));
  const [permission, requestPermission] = useCameraPermissions();

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const exportData = () => {
    const selectedAccounts = accounts.filter((a: any) => selectedIds.includes(a.id));
    const data = JSON.stringify(selectedAccounts.map((a: any) => ({
      code: a.code,
      secret: a.secret,
      algo: a.algo,
      digits: a.digits,
      type: a.type,
      interval: a.interval,
      nonce: a.nonce
    })));
    return `sudarshan-sync:${data}`;
  };

  const handleStartExport = () => {
    setSelectedIds(accounts.map((a: any) => a.id));
    setMode('export');
  };

  const handleScan = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return;
    }
    setMode('import');
  };

  const onCodeScanned = (data: string) => {
    if (!data.startsWith('sudarshan-sync:')) return;
    try {
      const jsonStr = data.replace('sudarshan-sync:', '');
      const importedAccounts = JSON.parse(jsonStr);
      dispatch(importAccounts(importedAccounts));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (e) {
      console.warn('Import failed', e);
    }
  };

  return (
    <View style={styles.base}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable 
            style={styles.backBtn}
            onPress={() => mode === 'options' ? router.back() : setMode('options')}
          >
            <MaterialCommunityIcons 
              name={mode === 'options' ? "chevron-left" : "arrow-left"} 
              size={32} 
              color="#F8FAFC" 
            />
          </Pressable>
          <Text style={styles.title}>
            {mode === 'options' ? 'Transfer Accounts' : mode === 'export' ? 'Export' : 'Import'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {mode === 'options' && (
            <View style={styles.options}>
              <OptionCard 
                icon="export-variant"
                title="Create Transfer QR"
                subtitle="Share selected accounts via secure QR code"
                onPress={handleStartExport}
                color="#6366f1"
              />
              <OptionCard 
                icon="import"
                title="Scan Transfer QR"
                subtitle="Import accounts from another device"
                onPress={handleScan}
                color="#10b981"
              />
            </View>
          )}

          {mode === 'export' && (
            <View style={styles.exportContainer}>
              <View style={styles.selectionCard}>
                <Text style={styles.sectionTitle}>Select Accounts</Text>
                <View style={styles.accountList}>
                  {accounts.map((account: any) => (
                    <Pressable 
                      key={account.id} 
                      style={[styles.accountItem, selectedIds.includes(account.id) && styles.accountItemSelected]}
                      onPress={() => toggleSelect(account.id)}
                    >
                      <View style={styles.accountInfo}>
                        <Text style={styles.accountName}>{account.code}</Text>
                        <Text style={styles.accountType}>{account.type === 'time' ? 'TOTP' : 'HOTP'}</Text>
                      </View>
                      <MaterialCommunityIcons 
                        name={selectedIds.includes(account.id) ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                        size={24} 
                        color={selectedIds.includes(account.id) ? "#6366f1" : "#475569"} 
                      />
                    </Pressable>
                  ))}
                </View>
              </View>

              {selectedIds.length > 0 ? (
                <View style={styles.qrSection}>
                  <View style={styles.qrBackground}>
                    <QRCode
                      value={exportData()}
                      size={width * 0.6}
                      color="#000"
                      backgroundColor="#FFF"
                    />
                  </View>
                  <Text style={styles.hint}>Scan this code on your other device with Sudarshan installed</Text>
                </View>
              ) : (
                <View style={styles.emptySelection}>
                  <MaterialCommunityIcons name="selection-off" size={64} color="#1E293B" />
                  <Text style={styles.emptyText}>Select at least one account to generate a transfer QR code</Text>
                </View>
              )}
            </View>
          )}

          {mode === 'import' && (
            <View style={styles.importContainer}>
              <View style={styles.scannerWrapper}>
                <CameraView
                  style={styles.scanner}
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={({ data }) => onCodeScanned(data)}
                />
                <View style={styles.scanOverlay}>
                  <View style={styles.scanFrame} />
                </View>
              </View>
              <Text style={styles.hint}>Center the Transfer QR code within the frame to automatically import accounts</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const OptionCard = ({ icon, title, subtitle, onPress, color }: any) => (
  <Pressable style={styles.optionCard} onPress={onPress}>
    <LinearGradient
      colors={['rgba(30, 41, 59, 0.6)', 'rgba(15, 23, 42, 0.8)']}
      style={styles.optionGradient}
    >
      <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon} size={36} color={color} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#475569" />
    </LinearGradient>
  </Pressable>
);

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
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
  },
  options: {
    gap: 16,
  },
  optionCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: '#F1F5F9',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  exportContainer: {
    gap: 24,
  },
  selectionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  accountList: {
    maxHeight: 300,
    gap: 8,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  accountItemSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: '600',
  },
  accountType: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrBackground: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 32,
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  hint: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  emptySelection: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyText: {
    color: '#475569',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },
  importContainer: {
    alignItems: 'center',
  },
  scannerWrapper: {
    width: width - 40,
    height: width - 40,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  scanner: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: width * 0.6,
    height: width * 0.6,
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
});
