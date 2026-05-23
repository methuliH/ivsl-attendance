import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/colors';
import { Event } from '../types/api';

interface EventCardProps {
  event: Event;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr.replace(' ', 'T'));
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTimeRange(start: string, end: string): string {
  const startDate = new Date(start.replace(' ', 'T'));
  const endDate = new Date(end.replace(' ', 'T'));
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.eyebrowRow}>
          <Text style={styles.eyebrow}>ACTIVE EVENT</Text>
          <View style={styles.eyebrowDot} />
          <Text style={styles.eyebrow}>CPD PROGRAMME</Text>
        </View>
        <Text style={styles.title} numberOfLines={3}>{event.event_title}</Text>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>{event.event_type} · {event.event_status}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <StatChip label="DATE" value={formatDate(event.event_start)} />
        <StatChip label="TIME" value={formatTimeRange(event.event_start, event.event_end)} />
        <StatChip label="CPD POINTS" value={String(event.event_cpds)} isCpd />
        <StatChip label="EVENT ID" value={`#${event.event_id}`} />
      </View>
    </View>
  );
}

interface StatChipProps {
  label: string;
  value: string;
  isCpd?: boolean;
}

function StatChip({ label, value, isCpd }: StatChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={isCpd ? styles.chipValueCpd : styles.chipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.wine,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
    }),
  },
  header: {
    backgroundColor: Colors.wine,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 8,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eyebrowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.burgundy,
  },
  eyebrow: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    color: 'rgba(242,229,198,0.50)',
    letterSpacing: 1.7,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 17,
    color: Colors.beige,
    lineHeight: 24,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(242,229,198,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(242,229,198,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    color: 'rgba(242,229,198,0.80)',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  body: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  chip: {
    gap: 3,
    minWidth: 72,
  },
  chipLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  chipValue: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: Colors.maroon,
  },
  chipValueCpd: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 15,
    color: Colors.maroon,
  },
});
