import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from './_layout';
import { getEvent } from '../constants/api';
import { Event } from '../types/api';
import { Colors } from '../constants/colors';
import TopBar from '../components/TopBar';
import EventCard from '../components/EventCard';
import QRScanner from '../components/QRScanner';
import ManualEntry from '../components/ManualEntry';
import ResultCard, { ErrorCard } from '../components/ResultCard';
import AttendeeList from '../components/AttendeeList';
import { useAttendance } from '../hooks/useAttendance';

type ActiveTab = 'qr' | 'manual';

export default function DashboardScreen() {
  const { token, employee, logout } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('qr');

  const scrollViewRef = useRef<ScrollView>(null);
  const { loading, result, error, attendees, processAttendance, clearResult } = useAttendance(token ?? '');

  const employeeName = employee
    ? `${employee.employee_firstname} ${employee.employee_lastname}`
    : '';

  useEffect(() => {
    if (!token) {
      router.replace('/');
      return;
    }
    fetchEvent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvent = async () => {
    if (!token) return;
    setEventLoading(true);
    setEventError('');
    try {
      const res = await getEvent(token);
      if (res.response_code === 200 && res.data?.Event) {
        setEvent(res.data.Event);
      } else {
        setEventError(res.response_message || 'Failed to load event details.');
      }
    } catch {
      setEventError('Network error. Could not load event details.');
    } finally {
      setEventLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 350);
  };

  const handleQRScan = useCallback(
    async (qrValue: string) => {
      clearResult();
      await processAttendance({ memberQr: qrValue });
      scrollToBottom();
    },
    [clearResult, processAttendance]
  );

  const handleManualSubmit = useCallback(
    async (memberId: number) => {
      clearResult();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await processAttendance({ memberId });
      scrollToBottom();
    },
    [clearResult, processAttendance]
  );

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    clearResult();
  };

  const handleSignOut = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <TopBar employeeName={employeeName} onSignOut={handleSignOut} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Event card */}
        {eventLoading ? (
          <View style={styles.eventLoadingWrap}>
            <ActivityIndicator color="#1A1918" />
          </View>
        ) : eventError ? (
          <View style={styles.eventErrorWrap}>
            <Text style={styles.eventErrorText}>{eventError}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchEvent} activeOpacity={0.8}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : event ? (
          <EventCard event={event} />
        ) : null}

        {/* Tab switcher */}
        <View style={styles.tabBar}>
          <TabButton
            label="Scan QR Code"
            icon="qr-code-outline"
            active={activeTab === 'qr'}
            onPress={() => handleTabChange('qr')}
          />
          <TabButton
            label="Enter ID"
            icon="clipboard-outline"
            active={activeTab === 'manual'}
            onPress={() => handleTabChange('manual')}
          />
        </View>

        {/* Active panel */}
        {activeTab === 'qr' ? (
          <View style={styles.scannerWrap}>
            <QRScanner onScan={handleQRScan} disabled={loading} />
          </View>
        ) : (
          <ManualEntry onSubmit={handleManualSubmit} loading={loading} />
        )}

        {/* Processing indicator */}
        {loading ? (
          <View style={styles.processingRow}>
            <ActivityIndicator size="small" color="#1A1918" />
            <Text style={styles.processingText}>Processing member…</Text>
          </View>
        ) : null}

        {/* Result card */}
        {!loading && result ? <ResultCard result={result} /> : null}
        {!loading && error ? <ErrorCard message={error} /> : null}

        {/* Attendee count + list */}
        <AttendeeList attendees={attendees} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

interface TabButtonProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  active: boolean;
  onPress: () => void;
}

function TabButton({ label, icon, active, onPress }: TabButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={15} color={active ? '#1A1918' : 'rgba(86,11,24,0.50)'} />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.beige,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  eventLoadingWrap: {
    marginHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
  },
  eventErrorWrap: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  eventErrorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  retryBtn: {
    backgroundColor: '#1A1918',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.sand,
    borderRadius: 12,
    padding: 5,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 9,
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C9C8C4',
  },
  tabLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: 'rgba(86,11,24,0.50)',
  },
  tabLabelActive: {
    color: '#1A1918',
  },
  scannerWrap: {
    marginHorizontal: 20,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  processingText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Colors.textMuted,
  },
  bottomSpacer: {
    height: 16,
  },
});
