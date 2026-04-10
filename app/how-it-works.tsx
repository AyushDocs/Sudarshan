import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, StatusBar, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setHasSeenOnboarding } from '../store/slices/settingsSlice';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: "Offline First",
    desc: "Sudarshan never connects to the internet. Your data stays on your device, always.",
    icon: "shield-airplane-outline",
    color: "#6366f1"
  },
  {
    title: "Pure Encryption",
    desc: "Every record is protected by hardware-backed encryption keys unique to your phone.",
    icon: "lock-check-outline",
    color: "#10b981"
  },
  {
    title: "Instant Access",
    desc: "Unlock your vault instantly with biometrics or your secure Master Password.",
    icon: "fingerprint",
    color: "#f59e0b"
  }
];

export default function HowItWorksScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const dispatch = useDispatch();
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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    setActiveIndex(Math.round(x / width));
  };

  const handleDone = () => {
    dispatch(setHasSeenOnboarding());
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.base, { backgroundColor: themeStyles.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: themeStyles.btnBg }]}>
            <MaterialCommunityIcons name="close" size={24} color={themeStyles.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: themeStyles.text }]}>How it works</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.slides}
        >
          {SLIDES.map((slide, index) => (
            <View key={index} style={styles.slide}>
              <View style={[styles.iconContainer, { backgroundColor: `${slide.color}15` }]}>
                <MaterialCommunityIcons name={slide.icon as any} size={80} color={slide.color} />
              </View>
              <Text style={[styles.slideTitle, { color: themeStyles.text }]}>{slide.title}</Text>
              <Text style={[styles.slideDesc, { color: themeStyles.subText }]}>{slide.desc}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {SLIDES.map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  { backgroundColor: i === activeIndex ? '#6366f1' : (isDark ? '#333' : '#E2E8F0') }
                ]} 
              />
            ))}
          </View>

          <Pressable style={styles.doneBtn} onPress={handleDone}>
            <Text style={styles.doneBtnText}>Got it</Text>
          </Pressable>
        </View>
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
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slides: { flex: 1 },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  slideTitle: { fontSize: 28, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
  slideDesc: { fontSize: 16, textAlign: 'center', lineHeight: 24, fontWeight: '500' },
  footer: { padding: 40, alignItems: 'center', gap: 32 },
  pagination: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  doneBtn: {
    backgroundColor: '#6366f1',
    width: '100%',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
