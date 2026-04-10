import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, StatusBar, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateProfile } from '../store/slices/userSlice';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const accounts = useSelector((state: RootState) => state.auth.accounts);
  const { privacyEnabled, theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState(user.image);

  const hasChanges = useMemo(() => {
    return name !== user.name || email !== user.email || image !== user.image || password.length > 0;
  }, [name, email, image, password, user]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = () => {
    dispatch(updateProfile({ 
      name, 
      email, 
      image,
      hasPassword: password.length > 0 || user.hasPassword
    }));
    setPassword('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const calculateHealth = useMemo(() => {
    let score = 0;
    let total = 0;
    const recommendations = [];
    
    total += 40;
    if (privacyEnabled) score += 20;
    else recommendations.push({ id: 'privacy', icon: 'shield-lock-outline' as const, text: 'Enable Privacy Lock in Settings', action: () => router.push('/settings') });

    if (user.hasPassword) score += 20;
    else recommendations.push({ id: 'password', icon: 'shield-key-outline' as const, text: 'Set a Master Password', action: () => {} });

    if (accounts.length > 0) {
      let shortSecrets = 0;
      accounts.forEach(acc => {
        total += 20;
        if (acc.secret.length >= 16) score += 10; else shortSecrets++;
        if (acc.digits >= 6) score += 10;
      });
      if (shortSecrets > 0) recommendations.push({ id: 'secret', icon: 'key-chain-variant' as const, text: `Use longer secrets for ${shortSecrets} account(s)` });
    } else {
      total += 30;
      recommendations.push({ id: 'accounts', icon: 'plus-circle-outline' as const, text: 'Add your first MFA account', action: () => router.back() });
    }

    const percentage = Math.round((score / total) * 100);
    return {
      percentage,
      label: percentage > 80 ? 'Excellent' : percentage > 50 ? 'Good' : 'Needs Work',
      color: percentage > 80 ? '#10b981' : percentage > 50 ? '#f59e0b' : '#ef4444',
      recommendations
    };
  }, [accounts, privacyEnabled, user.hasPassword]);

  const themeStyles = {
    bg: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#F8FAFC' : '#0F172A',
    card: isDark ? '#111111' : '#F1F5F9',
    inputBg: isDark ? '#1A1A1A' : '#F8FAFC',
    borderColor: isDark ? '#222222' : '#E2E8F0',
    subText: isDark ? '#64748B' : '#475569',
    btnPressed: isDark ? '#333333' : '#E2E8F0',
  };

  return (
    <View style={[styles.base, { backgroundColor: themeStyles.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: themeStyles.inputBg }]}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={themeStyles.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: themeStyles.text }]}>Profile</Text>
          <Pressable 
            onPress={handleSave} 
            disabled={!hasChanges}
            style={[styles.saveBtn, !hasChanges && styles.saveBtnDisabled]}
          >
            <Text style={[styles.saveBtnText, !hasChanges && styles.saveBtnTextDisabled]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarContainer}>
            <Pressable onPress={pickImage} style={[styles.avatarWrapper, { borderColor: isDark ? '#333' : '#E2E8F0' }]}>
              {image ? (
                <Image source={{ uri: image }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: themeStyles.inputBg }]}>
                  <MaterialCommunityIcons name="account" size={60} color="#6366f1" />
                </View>
              )}
              <View style={styles.editIconWrapper}>
                <MaterialCommunityIcons name="camera" size={18} color="white" />
              </View>
            </Pressable>
            <Text style={[styles.avatarHint, { color: themeStyles.subText }]}>Tap to change avatar</Text>
          </View>

          <View style={[styles.healthCard, { backgroundColor: themeStyles.card, borderColor: themeStyles.borderColor }]}>
             <View style={styles.healthInfo}>
                <View>
                  <Text style={[styles.healthTitle, { color: themeStyles.text }]}>Vault Health</Text>
                  <Text style={[styles.healthStatus, { color: calculateHealth.color }]}>
                    {calculateHealth.label} • {calculateHealth.percentage}% Secure
                  </Text>
                </View>
                <View style={[styles.healthBadge, { backgroundColor: `${calculateHealth.color}20` }]}>
                    <MaterialCommunityIcons name="shield-check" size={24} color={calculateHealth.color} />
                </View>
             </View>
             <View style={styles.healthBarBg}>
                <View style={[styles.healthBarFill, { width: `${calculateHealth.percentage}%`, backgroundColor: calculateHealth.color }]} />
             </View>
          </View>

          {calculateHealth.recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeStyles.subText }]}>Security Recommendations</Text>
              <View style={styles.recommendationList}>
                {calculateHealth.recommendations.map(rec => (
                  <Pressable 
                    key={rec.id} 
                    style={[styles.recommendationCard, { backgroundColor: themeStyles.card, borderColor: themeStyles.borderColor }]}
                    onPress={rec.action}
                  >
                    <View style={[styles.recIconBox, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
                      <MaterialCommunityIcons name={rec.icon} size={20} color="#6366f1" />
                    </View>
                    <Text style={[styles.recommendationText, { color: themeStyles.text }]}>{rec.text}</Text>
                    {rec.action && <MaterialCommunityIcons name="chevron-right" size={18} color={themeStyles.subText} />}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeStyles.subText }]}>Identification</Text>
            <View style={[styles.inputCard, { backgroundColor: themeStyles.card, borderColor: themeStyles.borderColor }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeStyles.subText }]}>FULL NAME</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="account-outline" size={20} color={themeStyles.subText} />
                  <TextInput
                    style={[styles.input, { color: themeStyles.text }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor={themeStyles.subText}
                  />
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: themeStyles.borderColor }]} />
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeStyles.subText }]}>EMAIL ADDRESS</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="email-outline" size={20} color={themeStyles.subText} />
                  <TextInput
                    style={[styles.input, { color: themeStyles.text }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={themeStyles.subText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeStyles.subText }]}>Security</Text>
            <View style={[styles.inputCard, { backgroundColor: themeStyles.card, borderColor: themeStyles.borderColor }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeStyles.subText }]}>MASTER PASSWORD</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="shield-key-outline" size={20} color={themeStyles.subText} />
                  <TextInput
                    style={[styles.input, { color: themeStyles.text }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Update master password"
                    placeholderTextColor={themeStyles.subText}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={themeStyles.subText} 
                    />
                  </Pressable>
                </View>
              </View>
            </View>
             <Text style={[styles.securityHint, { color: themeStyles.subText }]}>
              The Master Password adds an extra layer of protection to your vault. It stays strictly on your device.
            </Text>
          </View>

          <View style={styles.actionSection}>
            <Pressable style={[styles.deleteBtn, { borderColor: isDark ? '#300' : '#FEE2E2' }]}>
              <Text style={styles.deleteText}>Clear All Vault Data</Text>
            </Pressable>

            <View style={styles.footerLinks}>
              <Pressable onPress={() => router.push('/privacy')}>
                <Text style={[styles.footerLinkText, { color: themeStyles.subText }]}>Privacy Policy</Text>
              </Pressable>
              <View style={[styles.footerDot, { backgroundColor: themeStyles.borderColor }]} />
              <Pressable onPress={() => router.push('/terms')}>
                <Text style={[styles.footerLinkText, { color: themeStyles.subText }]}>Terms of Service</Text>
              </Pressable>
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
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#6366f1',
  },
  saveBtnDisabled: { backgroundColor: 'rgba(99, 102, 241, 0.2)' },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  saveBtnTextDisabled: { color: 'rgba(255, 255, 255, 0.3)' },
  scrollContent: { padding: 24 },
  avatarContainer: { alignItems: 'center', marginBottom: 40 },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    position: 'relative',
    borderWidth: 2,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 60 },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    borderWidth: 3,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarHint: { fontSize: 13, fontWeight: '500' },
  healthCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
  },
  healthInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  healthTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  healthStatus: { fontSize: 14, fontWeight: '600' },
  healthBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthBarBg: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 4, overflow: 'hidden' },
  healthBarFill: { height: '100%', borderRadius: 4 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, paddingLeft: 4 },
  inputCard: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  inputGroup: { padding: 20 },
  label: { fontSize: 11, fontWeight: '800', marginBottom: 10, letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, fontSize: 16, fontWeight: '500', height: 24, padding: 0 },
  divider: { height: 1 },
  recommendationList: { gap: 12 },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  recIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  recommendationText: { flex: 1, fontSize: 14, fontWeight: '600' },
  securityHint: { fontSize: 12, marginTop: 12, lineHeight: 18, paddingHorizontal: 4 },
  actionSection: { marginTop: 16 },
  deleteBtn: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 12 },
  footerLinkText: { fontSize: 13, fontWeight: '600' },
  footerDot: { width: 4, height: 4, borderRadius: 2 }
});
