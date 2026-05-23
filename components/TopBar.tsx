import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
        <View style={styles.monogram}>
          <Text style={styles.monogramText}>IV</Text>
        </View>
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
    backgroundColor: Colors.wine,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 12,
  },
  monogram: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(242,229,198,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(242,229,198,0.18)',
  },
  monogramText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 14,
    color: Colors.beige,
    letterSpacing: 1,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 18,
    color: Colors.beige,
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: 'rgba(242,229,198,0.55)',
    lineHeight: 15,
  },
  signOutBtn: {
    backgroundColor: 'rgba(242,229,198,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(242,229,198,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  signOutText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: Colors.beige,
  },
});
