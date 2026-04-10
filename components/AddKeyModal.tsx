import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, Pressable, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export type NewKeyData = {
  type: 'time' | 'nonce';
  code: string;
  secret: string;
  algo: 'SHA1' | 'SHA256' | 'SHA512';
  digits: number;
  interval?: number;
  nonce?: string;
};

interface AddKeyModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: NewKeyData) => void;
}

export const AddKeyModal = ({ visible, onClose, onAdd }: AddKeyModalProps) => {
  const [step, setStep] = useState<'options' | 'manual' | 'scan'>('options');
  const [permission, requestPermission] = useCameraPermissions();
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';
  
  // Form State
  const [type, setType] = useState<'time' | 'nonce'>('time');
  const [label, setLabel] = useState('');
  const [secret, setSecret] = useState('');
  const [algo, setAlgo] = useState<'SHA1' | 'SHA256' | 'SHA512'>('SHA1');
  const [digits, setDigits] = useState('6');
  const [interval, setIntervalVal] = useState('30');
  const [nonce, setNonce] = useState('');

  const themeStyles = {
    bg: isDark ? '#111111' : '#FFFFFF',
    text: isDark ? '#F8FAFC' : '#0F172A',
    card: isDark ? '#1A1A1A' : '#F1F5F9',
    borderColor: isDark ? '#262626' : '#E2E8F0',
    subText: isDark ? '#64748B' : '#475569',
    inputBg: isDark ? '#1A1A1A' : '#F8FAFC',
  };

  const handleManualEntry = () => setStep('manual');
  
  const handleScan = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return;
    }
    setStep('scan');
  };

  const parseOTPAuth = (url: string) => {
    try {
      if (!url.startsWith('otpauth://')) return;
      const typeMatch = url.match(/otpauth:\/\/([^/?]+)/);
      const typeStr = typeMatch ? typeMatch[1] : 'totp';
      const labelMatch = url.match(/otpauth:\/\/[^/]+\/([^?]+)/);
      let labelStr = labelMatch ? decodeURIComponent(labelMatch[1]) : 'Unknown';
      if (labelStr.includes(':')) labelStr = labelStr.split(':').pop() || labelStr;
      const getParam = (name: string) => {
        const match = url.match(new RegExp(`[?&]${name}=([^&]+)`));
        return match ? decodeURIComponent(match[1]) : null;
      };
      setLabel(labelStr.trim().slice(0, 20)); // Limit length
      setSecret(getParam('secret') || '');
      const algoStr = (getParam('algorithm') || 'SHA1').toUpperCase() as any;
      setAlgo(['SHA1', 'SHA256', 'SHA512'].includes(algoStr) ? algoStr : 'SHA1');
      setDigits(getParam('digits') || '6');
      setIntervalVal(getParam('period') || '30');
      setType(typeStr === 'totp' ? 'time' : 'nonce');
      setStep('manual');
    } catch (e) { console.warn(e); }
  };

  const handleSave = () => {
    if (!label || !secret) return;
    onAdd({
      type,
      code: label,
      secret,
      algo,
      digits: parseInt(digits),
      interval: type === 'time' ? parseInt(interval) : undefined,
      nonce: type === 'nonce' ? nonce || '1' : undefined,
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep('options');
    setLabel('');
    setSecret('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <BlurView intensity={isDark ? 30 : 50} style={StyleSheet.absoluteFill} tint={isDark ? "dark" : "light"}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: themeStyles.bg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeStyles.text }]}>
                {step === 'options' ? 'Add Account' : step === 'manual' ? 'Account Details' : 'Scan QR Code'}
              </Text>
              <Pressable onPress={resetAndClose} style={[styles.closeBtn, { backgroundColor: themeStyles.inputBg }]}>
                <MaterialCommunityIcons name="close" size={20} color={themeStyles.text} />
              </Pressable>
            </View>

            {step === 'options' && (
              <View style={styles.optionsContainer}>
                <OptionButton 
                  icon="qrcode-scan" 
                  title="Scan QR Code" 
                  subtitle="Scan an account QR code"
                  onPress={handleScan}
                  themeStyles={themeStyles}
                />
                <OptionButton 
                  icon="keyboard-outline" 
                  title="Enter Manually" 
                  subtitle="Type in the account details"
                  onPress={handleManualEntry}
                  themeStyles={themeStyles}
                />
              </View>
            )}

            {step === 'scan' && (
              <View style={styles.cameraFrame}>
                <CameraView
                  style={styles.camera}
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={({ data }) => { if (data) parseOTPAuth(data); }}
                />
                <View style={styles.scanHintBox}>
                    <Text style={styles.scanHint}>Point the camera at the QR code</Text>
                </View>
              </View>
            )}

            {step === 'manual' && (
              <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                <View style={[styles.typeSelector, { backgroundColor: themeStyles.inputBg }]}>
                  <Pressable onPress={() => setType('time')} style={[styles.typeBtn, type === 'time' && { backgroundColor: isDark ? '#262626' : '#FFFFFF' }]}>
                    <Text style={[styles.typeBtnText, type === 'time' ? { color: '#6366f1' } : { color: themeStyles.subText }]}>Time-based</Text>
                  </Pressable>
                  <Pressable onPress={() => setType('nonce')} style={[styles.typeBtn, type === 'nonce' && { backgroundColor: isDark ? '#262626' : '#FFFFFF' }]}>
                    <Text style={[styles.typeBtnText, type === 'nonce' ? { color: '#6366f1' } : { color: themeStyles.subText }]}>Nonce-based</Text>
                  </Pressable>
                </View>

                <InputField label="Account Name" value={label} onChangeText={setLabel} placeholder="e.g. GitHub: user" themeStyles={themeStyles} />
                <InputField label="Secret Key" value={secret} onChangeText={setSecret} placeholder="Enter your key" autoCapitalize="characters" themeStyles={themeStyles} />
                
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={[styles.inputLabel, { color: themeStyles.subText }]}>Algorithm</Text>
                    <View style={[styles.pickerContainer, { backgroundColor: themeStyles.inputBg }]}>
                      {['SHA1', 'SHA256', 'SHA512'].map(a => (
                        <Pressable key={a} onPress={() => setAlgo(a as any)} style={[styles.pill, algo === a && { backgroundColor: isDark ? '#262626' : '#FFFFFF' }]}>
                          <Text style={[styles.pillText, algo === a ? { color: themeStyles.text } : { color: themeStyles.subText }]}>{a.replace('SHA', '')}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <View style={{ width: 100 }}>
                    <InputField label="Digits" value={digits} onChangeText={setDigits} keyboardType="numeric" themeStyles={themeStyles} />
                  </View>
                </View>

                {type === 'time' ? (
                  <InputField label="Interval (seconds)" value={interval} onChangeText={setIntervalVal} keyboardType="numeric" themeStyles={themeStyles} />
                ) : (
                  <InputField label="Starting Nonce" value={nonce} onChangeText={setNonce} placeholder="e.g. 1" themeStyles={themeStyles} />
                )}

                <Pressable onPress={handleSave} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save Account</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

const OptionButton = ({ icon, title, subtitle, onPress, themeStyles }: any) => (
  <Pressable style={[styles.optionBtn, { backgroundColor: themeStyles.card, borderColor: themeStyles.borderColor }]} onPress={onPress}>
    <View style={styles.optionIconContainer}>
      <MaterialCommunityIcons name={icon} size={28} color="#6366f1" />
    </View>
    <View>
      <Text style={[styles.optionTitle, { color: themeStyles.text }]}>{title}</Text>
      <Text style={[styles.optionSubtitle, { color: themeStyles.subText }]}>{subtitle}</Text>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={24} color={themeStyles.subText} style={{ marginLeft: 'auto' }} />
  </Pressable>
);

const InputField = ({ label, themeStyles, ...props }: any) => (
  <View style={styles.inputGroup}>
    <Text style={[styles.inputLabel, { color: themeStyles.subText }]}>{label}</Text>
    <TextInput 
      style={[styles.input, { backgroundColor: themeStyles.inputBg, color: themeStyles.text, borderColor: themeStyles.borderColor }]} 
      placeholderTextColor={themeStyles.subText} 
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContainer: { borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '85%', paddingTop: 32, paddingHorizontal: 24,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20 }, android: { elevation: 20 } })
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  optionsContainer: { gap: 16 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, gap: 16, borderWidth: 1 },
  optionIconContainer: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(99, 102, 241, 0.1)', justifyContent: 'center', alignItems: 'center' },
  optionTitle: { fontSize: 16, fontWeight: '700' },
  optionSubtitle: { fontSize: 13, marginTop: 2, fontWeight: '500' },
  formContainer: { flex: 1 },
  typeSelector: { flexDirection: 'row', padding: 6, borderRadius: 16, marginBottom: 24 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  typeBtnText: { fontWeight: '700', fontSize: 14 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderRadius: 14, padding: 16, fontSize: 16, fontWeight: '500', borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  pickerContainer: { flexDirection: 'row', gap: 6, padding: 6, borderRadius: 14, height: 56, alignItems: 'center' },
  pill: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  pillText: { fontSize: 12, fontWeight: '800' },
  saveBtn: { marginTop: 24, marginBottom: 60, backgroundColor: '#6366f1', borderRadius: 18, height: 56, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  cameraFrame: { flex: 1, borderRadius: 24, overflow: 'hidden', marginBottom: 40, maxHeight: 400 },
  camera: { flex: 1 },
  scanHintBox: { position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  scanHint: { color: 'white', fontWeight: '600' }
});
