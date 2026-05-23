import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';

interface QRScannerProps {
  onScan: (qrValue: string) => void;
  disabled?: boolean;
}

const SCAN_COOLDOWN_MS = 3500;
const CAMERA_SIZE = Dimensions.get('window').width - 40;

function extractQrValue(data: string): string {
  try {
    const url = new URL(data);
    const qr = url.searchParams.get('qr');
    if (qr) return qr;
  } catch {
    // not a URL — fall through
  }
  // Fallback regex for environments without full URL support
  const match = data.match(/[?&]qr=([^&]+)/);
  return match ? match[1] : data;
}

export default function QRScanner({ onScan, disabled }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);
  const lastScanTime = useRef(0);

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const borderFlashAnim = useRef(new Animated.Value(0)).current;
  const scanLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (cameraActive) {
      scanLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      scanLoopRef.current.start();
    } else {
      scanLoopRef.current?.stop();
      scanLineAnim.setValue(0);
    }
    return () => scanLoopRef.current?.stop();
  }, [cameraActive, scanLineAnim]);

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (disabled) return;
      const now = Date.now();
      if (now - lastScanTime.current < SCAN_COOLDOWN_MS) return;
      lastScanTime.current = now;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Animated.sequence([
        Animated.timing(borderFlashAnim, { toValue: 1, duration: 100, useNativeDriver: false }),
        Animated.timing(borderFlashAnim, { toValue: 0, duration: 500, useNativeDriver: false }),
      ]).start();

      onScan(extractQrValue(data));
    },
    [disabled, onScan, borderFlashAnim]
  );

  const handleStartCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setCameraActive(true);
  };

  const borderColor = borderFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.borderStrong, Colors.ok],
  });

  const overlaySize = CAMERA_SIZE * 0.62;
  const overlayOffset = (CAMERA_SIZE - overlaySize) / 2;

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, overlaySize - 2],
  });

  if (!cameraActive) {
    return (
      <View style={styles.placeholder}>
        <TouchableOpacity style={styles.startBtn} onPress={handleStartCamera} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={28} color={Colors.beige} />
        </TouchableOpacity>
        <Text style={styles.startTitle}>Start Camera</Text>
        <Text style={styles.startSubtitle}>Tap to activate QR scanner</Text>
      </View>
    );
  }

  if (permission && !permission.granted) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="camera-outline" size={32} color="rgba(242,229,198,0.45)" />
        <Text style={styles.startTitle}>Camera Access Denied</Text>
        <Text style={styles.startSubtitle}>Enable camera permissions in device settings</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.8}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.cameraContainer, { borderColor }]}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={disabled ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Corner bracket overlay */}
      <View
        style={[
          styles.overlay,
          { left: overlayOffset, top: overlayOffset, width: overlaySize, height: overlaySize },
        ]}
      >
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
        <Animated.View
          style={[styles.scanLine, { transform: [{ translateY: scanLineTranslateY }] }]}
        />
      </View>

      {/* Bottom hint */}
      <View style={styles.hintWrap}>
        <Text style={styles.hintText}>Align QR code within the frame</Text>
      </View>
    </Animated.View>
  );
}

const CORNER_SIZE = 22;
const CORNER_THICKNESS = 2.5;

const styles = StyleSheet.create({
  placeholder: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    backgroundColor: Colors.wine,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(242,229,198,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(242,229,198,0.15)',
    marginBottom: 4,
  },
  startTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: Colors.beige,
  },
  startSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(242,229,198,0.50)',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  permBtn: {
    marginTop: 12,
    backgroundColor: '#1A1918',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  permBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  cameraContainer: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: Colors.wine,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  overlay: {
    position: 'absolute',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Colors.sand,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  scanLine: {
    height: 1.5,
    width: '100%',
    backgroundColor: Colors.sand,
    opacity: 0.75,
  },
  hintWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 18,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  hintText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: 'rgba(242,229,198,0.70)',
  },
});
