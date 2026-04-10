import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, TextInput, StatusBar, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addAccount, importAccounts, AuthItem } from '../store/slices/authSlice';
import { Sidebar } from '../components/Sidebar';
import { MFARow } from '../components/MFARow';
import { AddKeyModal, NewKeyData } from '../components/AddKeyModal';

export default function HomeScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();

  const accounts = useSelector((state: RootState) => state.auth.accounts);
  const { privacyEnabled, isLocked, theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';
  const user = useSelector((state: RootState) => state.user);
  
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAuths = useMemo(() => {
    if (!searchQuery) return accounts;
    return accounts.filter(a => 
      a.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [accounts, searchQuery]);

  const handleAddKey = (data: NewKeyData) => {
    const newItem: AuthItem = {
      ...data,
      id: Date.now(),
      timeStamp: Date.now(),
    } as AuthItem;
    dispatch(addAccount(newItem));
  };

  const handleImport = (imported: any[]) => {
    dispatch(importAccounts(imported));
  };

  React.useEffect(() => {
    if (privacyEnabled && isLocked) {
      router.replace('/lock');
    }
  }, [privacyEnabled, isLocked]);

  React.useEffect(() => {
    if (params.imported) {
      try {
        const imported = JSON.parse(params.imported as string);
        handleImport(imported);
        router.setParams({ imported: undefined });
      } catch (e) {
        console.error("Failed to parse imported accounts", e);
      }
    }
  }, [params.imported]);

  const themeStyles = {
    bg: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#F8FAFC' : '#0F172A',
    navbarBg: isDark ? '#111111' : '#F8FAFC',
    searchBg: isDark ? '#111111' : '#F1F5F9',
    borderColor: isDark ? '#222222' : '#E2E8F0',
    subText: isDark ? '#64748B' : '#475569',
  };

  return (
    <View style={[styles.base, { backgroundColor: themeStyles.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themeStyles.bg }]} edges={['top']}>
        {/* Top Navbar */}
        <View style={[styles.navbar, { borderBottomColor: themeStyles.borderColor }]}>
          <Pressable 
            style={[styles.navIcon, { backgroundColor: themeStyles.searchBg }]}
            onPress={() => setSidebarVisible(true)}
          >
            <MaterialCommunityIcons name="menu" size={26} color={themeStyles.text} />
          </Pressable>
          <View style={styles.branding}>
            <Image source={require('../assets/images/icon.png')} style={styles.logoIcon} />
            <Text style={[styles.navTitle, { color: themeStyles.text }]}>Sudarshan</Text>
          </View>
          <Pressable 
            style={[styles.navIcon, { backgroundColor: themeStyles.searchBg }]}
            onPress={() => router.push('/profile')}
          >
            {user.image ? (
              <Image source={{ uri: user.image }} style={styles.navAvatar} />
            ) : (
              <MaterialCommunityIcons name="account-circle-outline" size={26} color={themeStyles.text} />
            )}
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBackground, { backgroundColor: themeStyles.searchBg, borderColor: themeStyles.borderColor }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={themeStyles.subText} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: themeStyles.text }]}
              placeholder="Search accounts..."
              placeholderTextColor={themeStyles.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
          </View>
        </View>

        <ScrollView 
          style={styles.flex} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredAuths.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name={searchQuery ? "magnify-remove-outline" : "shield-off-outline"} 
                size={80} 
                color={isDark ? "#1A1A1A" : "#F1F5F9"} 
              />
              <Text style={[styles.emptyTitle, { color: themeStyles.text }]}>
                {searchQuery ? "No matches found" : "No Accounts Yet"}
              </Text>
              <Text style={[styles.emptySubtitle, { color: themeStyles.subText }]}>
                {searchQuery 
                  ? `We couldn't find anything matching "${searchQuery}"`
                  : "Tap the + button to add your first secure account"
                }
              </Text>
            </View>
          ) : (
            <View style={styles.cardGrid}>
              {filteredAuths.map((item) => (
                <MFARow key={item.id} item={item} />
              ))}
            </View>
          )}

          <View style={styles.footerSpacing} />
        </ScrollView>

        {/* Floating Action Button */}
        <Pressable 
          style={styles.fab}
          onPress={() => setAddModalVisible(true)}
        >
          <MaterialCommunityIcons name="plus" size={32} color="white" />
        </Pressable>

        <Sidebar 
          visible={sidebarVisible} 
          onClose={() => setSidebarVisible(false)}
          onTransferPress={() => router.push('/transfer')}
          onHowItWorksPress={() => router.push('/how-it-works')}
          onBackupsPress={() => router.push('/backups')}
          onSettingsPress={() => router.push('/settings')}
          onHelpPress={() => router.push('/help')}
        />

        <AddKeyModal 
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onAdd={handleAddKey}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  cardGrid: {
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  footerSpacing: {
    height: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
});
