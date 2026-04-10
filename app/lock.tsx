import React from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setLocked } from '../store/slices/settingsSlice';

export default function LockScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  React.useEffect(() => {
    // Small delay to ensure the UI has settled
    const timer = setTimeout(() => {
      authenticate();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Sudarshan Vault',
      fallbackLabel: 'Use Passcode',
    });
    if (result.success) {
      dispatch(setLocked(false));
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="shield-lock" size={100} color="#6366f1" />
          </View>
          <Text style={styles.title}>Vault Locked</Text>
          <Text style={styles.subtitle}>Authentication required to view sensitive codes</Text>
          
          <Pressable style={styles.unlockBtn} onPress={authenticate}>
            <LinearGradient
              colors={['#6366f1', '#4f46e5']}
              style={styles.unlockGradient}
            >
              <Text style={styles.unlockText}>Unlock Vault</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 48,
  },
  unlockBtn: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  unlockGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});
