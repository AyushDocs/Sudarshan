import React from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, Platform, Modal, Image } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onTransferPress: () => void;
  onHowItWorksPress: () => void;
  onBackupsPress: () => void;
  onSettingsPress: () => void;
  onHelpPress: () => void;
}

export const Sidebar = ({ 
  visible, 
  onClose, 
  onTransferPress, 
  onHowItWorksPress,
  onBackupsPress,
  onSettingsPress,
  onHelpPress
}: SidebarProps) => {
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';

  const sidebarStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(visible ? 0 : -SIDEBAR_WIDTH, {
            damping: 20,
            stiffness: 90,
          }),
        },
      ],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(visible ? 1 : 0),
    };
  });

  const themeStyles = {
    bg: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#F8FAFC' : '#0F172A',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    overlay: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)',
    menuIcon: isDark ? '#94A3B8' : '#64748B',
    menuText: isDark ? '#CBD5E1' : '#334155',
    btnPressed: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.flex}>
        {/* Overlay */}
        <Animated.View style={[styles.overlay, overlayStyle, { backgroundColor: themeStyles.overlay }]}>
          <Pressable style={styles.flex} onPress={onClose} />
        </Animated.View>

        {/* Sidebar Content */}
        <Animated.View style={[styles.sidebar, sidebarStyle, { backgroundColor: themeStyles.bg, borderColor: themeStyles.borderColor }]}>
          <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.profileSection}>
              <View style={styles.sidebarLogoWrapper}>
                <Image source={require('../assets/images/icon.png')} style={styles.sidebarLogo} />
              </View>
              <View>
                <Text style={[styles.profileName, { color: themeStyles.text }]}>Sudarshan Vault</Text>
                <Text style={styles.profileStatus}>Secure Mode Active</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: themeStyles.borderColor }]} />

            <View style={styles.menuItems}>
              <MenuButton 
                icon="swap-horizontal" 
                label="Transfer Codes" 
                themeStyles={themeStyles}
                onPress={() => {
                  onClose();
                  onTransferPress();
                }} 
              />
              <MenuButton 
                icon="briefcase-variant-outline" 
                label="Key Backups" 
                themeStyles={themeStyles}
                onPress={() => {
                  onClose();
                  onBackupsPress();
                }} 
              />
              <MenuButton 
                icon="information-outline" 
                label="How it works" 
                themeStyles={themeStyles}
                onPress={() => {
                  onClose();
                  onHowItWorksPress();
                }} 
              />
              <MenuButton 
                icon="cog-outline" 
                label="Settings" 
                themeStyles={themeStyles}
                onPress={() => {
                  onClose();
                  onSettingsPress();
                }} 
              />
            </View>

            <View style={styles.footer}>
              <MenuButton 
                icon="help-circle-outline" 
                label="Help & Feedback" 
                themeStyles={themeStyles}
                onPress={() => {
                  onClose();
                  onHelpPress();
                }} 
              />
              <View style={styles.versionContainer}>
                <Text style={styles.versionText}>v1.0.0 Alpha</Text>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

interface MenuButtonProps {
  icon: any;
  label: string;
  onPress: () => void;
  themeStyles: any;
}

const MenuButton = ({ icon, label, onPress, themeStyles }: MenuButtonProps) => (
  <Pressable 
    style={({ pressed }) => [
        styles.menuBtn, 
        pressed && { backgroundColor: themeStyles.btnPressed }
    ]} 
    onPress={onPress}
  >
    <View style={[styles.iconContainer, { backgroundColor: themeStyles.btnPressed }]}>
      <MaterialCommunityIcons name={icon} size={22} color={themeStyles.menuIcon} />
    </View>
    <Text style={[styles.menuLabel, { color: themeStyles.menuText }]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  sidebarLogoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    overflow: 'hidden',
  },
  sidebarLogo: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileStatus: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginBottom: 24,
  },
  menuItems: {
    flex: 1,
    gap: 8,
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 20,
    gap: 12,
  },
  versionContainer: {
    paddingHorizontal: 12,
  },
  versionText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
  },
});
