import { useState, useCallback } from 'react';
import { markAttendance } from '../constants/api';
import { EventMember } from '../types/api';

interface AttendanceState {
  loading: boolean;
  result: EventMember | null;
  error: string | null;
  attendees: EventMember[];
}

export function useAttendance(token: string) {
  const [state, setState] = useState<AttendanceState>({
    loading: false,
    result: null,
    error: null,
    attendees: [],
  });

  const processAttendance = useCallback(
    async (params: { memberId?: number; memberQr?: string }) => {
      setState(prev => ({ ...prev, loading: true, result: null, error: null }));
      try {
        const response = await markAttendance(token, params);
        if (response.response_code === 200 && response.data?.EventMember) {
          const member = response.data.EventMember;
          setState(prev => ({
            loading: false,
            result: member,
            error: null,
            // Upsert: move updated member to front, remove old entry if exists
            attendees: [
              member,
              ...prev.attendees.filter(
                a => String(a.member_idnumber) !== String(member.member_idnumber)
              ),
            ],
          }));
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            result: null,
            error: response.response_message || 'Member not found or not registered for this event.',
          }));
        }
      } catch {
        setState(prev => ({
          ...prev,
          loading: false,
          result: null,
          error: 'Network error. Please try again.',
        }));
      }
    },
    [token]
  );

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null, error: null }));
  }, []);

  return { ...state, processAttendance, clearResult };
}
