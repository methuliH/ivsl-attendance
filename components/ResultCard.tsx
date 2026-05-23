import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Colors } from '../constants/colors';
import { EventMember } from '../types/api';

function getStatusAccent(remarks: string): string {
  switch (remarks) {
    case 'CHECK IN SUCCESS':
    case 'CHECK OUT SUCCESS':
      return Colors.ok;
    case 'ALREADY CHECKED IN':
      return Colors.warn;
    default:
      return Colors.burgundy;
  }
}

function getStatusBg(remarks: string): string {
  switch (remarks) {
    case 'CHECK IN SUCCESS':
    case 'CHECK OUT SUCCESS':
      return Colors.okDim;
    case 'ALREADY CHECKED IN':
      return Colors.warnDim;
    default:
      return 'rgba(117,22,45,0.08)';
  }
}

function getInitials(name: string | null | undefined, idnumber?: number): string {
  if (name) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  }
  if (idnumber) return String(idnumber).slice(-2);
  return '?';
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr.replace(' ', 'T'));
  const datePart = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart}, ${timePart}`;
}

function useSlideIn() {
  const slideAnim = useRef(new Animated.Value(18)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 9,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return { slideAnim, fadeAnim };
}

interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
}

function DetailRow({ label, value, valueColor }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

interface ResultCardProps {
  result: EventMember;
}

export default function ResultCard({ result }: ResultCardProps) {
  const { slideAnim, fadeAnim } = useSlideIn();

  const accent = getStatusAccent(result.em_remarks);
  const statusBg = getStatusBg(result.em_remarks);
  const initials = getInitials(result.member_name, result.member_idnumber);

  return (
    <Animated.View
      style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.body}>
        <View style={styles.topSection}>
          <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: accent }]}>{result.em_remarks}</Text>
          </View>
          <View style={styles.memberRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName} numberOfLines={2}>
                {result.member_name || `Member #${result.member_idnumber}`}
              </Text>
              <Text style={styles.memberId}>IVSL #{result.member_idnumber}</Text>
            </View>
          </View>
        </View>
        <View style={styles.detailSection}>
          <DetailRow
            label="Payment Status"
            value={result.em_paystatus}
            valueColor={result.em_paystatus === 'PAID' ? Colors.ok : Colors.burgundy}
          />
          <View style={styles.divider} />
          <DetailRow label="Checked In" value={formatDateTime(result.em_checkin)} />
          {result.em_checkout ? (
            <>
              <View style={styles.divider} />
              <DetailRow label="Checked Out" value={formatDateTime(result.em_checkout)} />
            </>
          ) : null}
          <View style={styles.divider} />
          <DetailRow label="CPD Points" value={result.em_cpds} />
        </View>
      </View>
    </Animated.View>
  );
}

interface ErrorCardProps {
  message: string;
}

export function ErrorCard({ message }: ErrorCardProps) {
  const { slideAnim, fadeAnim } = useSlideIn();

  return (
    <Animated.View
      style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={[styles.accentBar, { backgroundColor: Colors.burgundy }]} />
      <View style={styles.body}>
        <View style={styles.topSection}>
          <View style={[styles.statusPill, { backgroundColor: 'rgba(117,22,45,0.08)' }]}>
            <Text style={[styles.statusText, { color: Colors.burgundy }]}>NOT FOUND</Text>
          </View>
          <Text style={styles.errorMessage}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: Colors.wine,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: { elevation: 5 },
    }),
  },
  accentBar: {
    width: 4,
  },
  body: {
    flex: 1,
  },
  topSection: {
    padding: 16,
    gap: 12,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1918',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 18,
    color: Colors.beige,
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    color: Colors.wine,
    lineHeight: 26,
  },
  memberId: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
  },
  detailSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 7,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
  },
  detailValue: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: Colors.maroon,
  },
  errorMessage: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
