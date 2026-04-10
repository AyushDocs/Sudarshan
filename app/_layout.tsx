import '../services/crypto-polyfill';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider, useSelector } from 'react-redux';
import { store, RootState, persistor } from '../store';
import { PersistGate } from 'redux-persist/integration/react';
import { useColorScheme, AppState } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setLocked } from '../store/slices/settingsSlice';
import * as ScreenCapture from 'expo-screen-capture';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootLayoutContent />
      </PersistGate>
    </Provider>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const hasSeenOnboarding = useSelector((state: RootState) => state.settings.hasSeenOnboarding);
  const privacyEnabled = useSelector((state: RootState) => state.settings.privacyEnabled);
  const appState = useRef(AppState.currentState);

  // Prevent screenshots and screen recording when privacy is enabled
  ScreenCapture.usePreventScreenCapture();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // If moving to inactive/background, and privacy is on, lock it!
      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/) &&
        privacyEnabled
      ) {
        dispatch(setLocked(true));
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [privacyEnabled, dispatch]);

  useEffect(() => {
    // Only redirect if they haven't seen it and aren't already on the page
    if (!hasSeenOnboarding && pathname !== '/how-it-works') {
      router.replace({
        pathname: '/how-it-works',
        params: { onboarding: 'true' }
      });
    }
  }, [hasSeenOnboarding, pathname, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="lock" options={{ animation: 'fade' }} />
        <Stack.Screen name="transfer" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="how-it-works" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="backups" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="help" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="privacy" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="terms" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
