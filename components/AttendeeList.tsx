import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { EventMember } from '../types/api';

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr.replace(' ', 'T'));
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getStatusColor(remarks: string): string {
  switch (remarks) {
    case 'CHECK IN SUCCESS':
    case 'ALREADY CHECKED IN':
      return Colors.ok;
    case 'CHECK OUT SUCCESS':
      return Colors.textMuted;
    default:
      return Colors.textMuted;
  }
}

interface AttendeeRowProps {
  member: EventMember;
  isLast: boolean;
}

function AttendeeRow({ member, isLast }: AttendeeRowProps) {
  const statusColor = getStatusColor(member.em_remarks);
  const isCheckedIn = member.em_status === 'CHECKED IN';

  return (
    <>
      <View style={styles.row}>
        <View style={[styles.avatar, isCheckedIn ? styles.avatarIn : styles.avatarOut]}>
          <Text style={styles.avatarText}>{getInitials(member.member_name)}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.memberName} numberOfLines={1}>{member.member_name ?? '—'}</Text>
          <Text style={styles.memberId}>#{member.member_idnumber}</Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={[styles.status, { color: statusColor }]}>
            {isCheckedIn ? 'IN' : 'OUT'}
          </Text>
          <Text style={styles.time}>{formatTime(isCheckedIn ? member.em_checkin : member.em_checkout)}</Text>
        </View>
      </View>
      {!isLast && <View style={styles.divider} />}
    </>
  );
}

interface AttendeeListProps {
  attendees: EventMember[];
}

export default function AttendeeList({ attendees }: AttendeeListProps) {
  if (attendees.length === 0) return null;

  // Deduplicate by member_idnumber (guards against mixed string/number types from API)
  const seen = new Set<string>();
  const unique = attendees.filter(a => {
    const key = String(a.member_idnumber);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const checkedIn = unique.filter(a => a.em_status === 'CHECKED IN').length;
  const checkedOut = unique.filter(a => a.em_status === 'CHECKED OUT').length;

  return (
    <View style={styles.card}>
      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{checkedIn}</Text>
          <Text style={styles.statLabel}>PRESENT</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{checkedOut}</Text>
          <Text style={styles.statLabel}>DEPARTED</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{unique.length}</Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </View>
      </View>

      {/* List header */}
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>ATTENDEES THIS SESSION</Text>
      </View>

      {/* Attendee rows */}
      <View style={styles.list}>
        {unique.map((member, index) => (
          <AttendeeRow
            key={String(member.member_idnumber)}
            member={member}
            isLast={index === unique.length - 1}
          />
        ))}
      </View>
    </View>
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
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    color: Colors.wine,
    lineHeight: 32,
  },
  statLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  listHeaderText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarIn: {
    backgroundColor: Colors.okDim,
  },
  avatarOut: {
    backgroundColor: 'rgba(86,11,24,0.07)',
  },
  avatarText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 13,
    color: Colors.maroon,
  },
  rowInfo: {
    flex: 1,
    gap: 1,
  },
  memberName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Colors.textPrimary,
  },
  memberId: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  status: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  time: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
