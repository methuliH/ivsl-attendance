import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

interface TopBarProps {
  employeeName: string;
  onSignOut: () => void;
}

export default function TopBar({ employeeName, onSignOut }: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.left}>
        <Image
          source={require('../assets/logo_ivsl.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.titleGroup}>
          <Text style={styles.title}>Attendance</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{employeeName}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut} activeOpacity={0.8}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  logo: {
    width: 72,
    height: 28,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 18,
    color: Colors.wine,
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 15,
  },
  signOutBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  signOutText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: Colors.textPrimary,
  },
});
