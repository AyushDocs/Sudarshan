import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Switch, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setPrivacyEnabled } from '../store/slices/settingsSlice';

const { width } = Dimensions.get('window');

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ visible, onClose }: SettingsModalProps) => {
  const dispatch = useDispatch();
  const privacyEnabled = useSelector((state: RootState) => state.settings.privacyEnabled);

  const onTogglePrivacy = (val: boolean) => {
    dispatch(setPrivacyEnabled(val));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#94A3B8" />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                  <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#6366f1" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Privacy Lock</Text>
                  <Text style={styles.settingDesc}>Require screen lock to view codes</Text>
                </View>
              </View>
              <Switch
                value={privacyEnabled}
                onValueChange={onTogglePrivacy}
                trackColor={{ false: '#1E293B', true: '#6366f1' }}
                thumbColor={privacyEnabled ? '#FFF' : '#94A3B8'}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(30, 41, 59, 0.5)' }]}>
                  <MaterialCommunityIcons name="theme-light-dark" size={22} color="#94A3B8" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Automatic Dark Mode</Text>
                  <Text style={styles.settingDesc}>Sync with system theme</Text>
                </View>
              </View>
              <Switch value={true} disabled />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>All cryptographic keys are stored locally on this device.</Text>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
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
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
  },
  settingDesc: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.03)',
  },
  footerText: {
    color: '#334155',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  }
});
