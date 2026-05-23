import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/colors';

interface MonogramProps {
  size?: number;
  fontSize?: number;
}

export default function Monogram({ size = 80, fontSize = 28 }: MonogramProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          ...Platform.select({
            ios: {
              shadowColor: 'rgba(117,22,45,1)',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.28,
              shadowRadius: 28,
            },
            android: { elevation: 12 },
          }),
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          { width: size - 6, height: size - 6, borderRadius: (size - 6) / 2 },
        ]}
      >
        <Text style={[styles.text, { fontSize }]}>IV</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(242,229,198,0.20)',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(242,229,198,0.15)',
  },
  text: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: Colors.beige,
    letterSpacing: 2,
  },
});
