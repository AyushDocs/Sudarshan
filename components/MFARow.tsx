import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeAccount } from '../store/slices/authSlice';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TimeStampMFACodeSer, NonceMFACodeSer, TimeStampMFACodeType, NonceMFACodeType } from '../services/index';
import { RootState } from '../store';

const getServiceInfo = (label: string, isDark: boolean) => {
  const normalized = label.toLowerCase();
  const defaultWhite = isDark ? '#F8FAFC' : '#1e293b';
  
  if (normalized.includes('google')) return { icon: 'google', color: '#EA4335' };
  if (normalized.includes('github')) return { icon: 'github', color: defaultWhite };
  if (normalized.includes('discord')) return { icon: 'discord', color: '#5865F2' };
  if (normalized.includes('amazon')) return { icon: 'amazon', color: '#FF9900' };
  if (normalized.includes('apple')) return { icon: 'apple', color: defaultWhite };
  if (normalized.includes('microsoft')) return { icon: 'microsoft-window', color: '#00A4EF' };
  if (normalized.includes('facebook')) return { icon: 'facebook', color: '#1877F2' };
  if (normalized.includes('twitter')) return { icon: 'twitter', color: '#1DA1F2' };
  if (normalized.includes('binance')) return { icon: 'bitcoin', color: '#F3BA2F' };
  if (normalized.includes('crypto')) return { icon: 'currency-btc', color: '#F0B90B' };
  if (normalized.includes('work')) return { icon: 'briefcase', color: '#6366f1' };
  return { icon: 'shield-account', color: '#6366f1' };
};

const BaseMFARow = ({ id, label, code, progress, type }: { id: number; label: string; code: string; progress: any; type: string }) => {
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';
  const dispatch = useDispatch();

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const copyToClipboard = async () => {
    const rawCode = code.replace(/\s/g, '');
    await Clipboard.setStringAsync(rawCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Delete Account",
      `Are you sure you want to remove ${label}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            if (id) dispatch(removeAccount(id));
          } 
        }
      ]
    );
  };

  const service = getServiceInfo(label, isDark);

  return (
    <Pressable 
      style={[styles.container, { 
        backgroundColor: isDark ? '#111111' : '#FFFFFF',
        borderColor: isDark ? '#222222' : '#E2E8F0',
      }]} 
      onPress={copyToClipboard}
      onLongPress={handleDelete}
      delayLongPress={500}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.labelRow}>
            <View style={[styles.serviceIcon, { backgroundColor: `${service.color}15` }]}>
              <MaterialCommunityIcons 
                name={service.icon as any} 
                size={16} 
                color={service.color} 
              />
            </View>
            <Text style={[styles.label, { color: isDark ? '#64748B' : '#64748B' }]}>{label}</Text>
          </View>
          <Text style={[styles.code, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>{code}</Text>
        </View>
        <View style={styles.right}>
          <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)' }]}>
            <Text style={styles.badgeText}>{type}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.progressContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)' }]}>
        <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
      </View>
    </Pressable>
  );
};

import { AuthItem } from '../store/slices/authSlice';

export const MFARow = ({ item }: { item: AuthItem }) => {
  if (item.type === 'time') {
    return <TimeStampMFARow item={item as TimeStampMFACodeType} />;
  }
  return <NonceMFARow item={item as NonceMFACodeType} />;
};

export const TimeStampMFARow = ({ item }: { item: TimeStampMFACodeType }) => {
  const [code, setCode] = useState("000 000");
  const progress = useSharedValue(1);

  useEffect(() => {
    const update = async () => {
      const service = new TimeStampMFACodeSer(
        item.id,
        item.code,
        item.secret,
        item.algo,
        item.digits,
        item.timeStamp,
        item.interval
      );
      const res = await service.generateCode();
      const formatted = res.slice(0, Math.ceil(res.length / 2)) + " " + res.slice(Math.ceil(res.length / 2));
      setCode(formatted);
      
      const now = Date.now();
      const intervalMs = item.interval * 1000;
      const remaining = intervalMs - (now % intervalMs);
      const fraction = remaining / intervalMs;
      progress.value = withTiming(fraction, { duration: 100 });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [item]);

  return <BaseMFARow id={item.id} label={item.code} code={code} progress={progress} type="TOTP" />;
};

export const NonceMFARow = ({ item }: { item: NonceMFACodeType }) => {
  const service = new NonceMFACodeSer(
    item.id,
    item.code,
    item.secret,
    item.algo,
    item.digits,
    item.nonce
  );
  const res = service.generateCode();
  const formatted = res.slice(0, Math.ceil(res.length / 2)) + " " + res.slice(Math.ceil(res.length / 2));
  const progress = useSharedValue(1);

  return <BaseMFARow id={item.id} label={item.code} code={formatted} progress={progress} type="HOTP" />;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 24,
  },
  left: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  serviceIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  code: {
    fontSize: 34,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 3,
  },
  right: { alignItems: 'flex-end' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { color: '#6366f1', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  progressContainer: { height: 4, width: '100%', position: 'absolute', bottom: 0 },
  progressBar: { height: '100%', backgroundColor: '#6366f1' },
});
