import { useState, useCallback } from 'react';
import { markAttendance } from '../constants/api';
import { EventMember } from '../types/api';

interface AttendanceState {
  loading: boolean;
  result: EventMember | null;
  error: string | null;
}

export function useAttendance(token: string) {
  const [state, setState] = useState<AttendanceState>({
    loading: false,
    result: null,
    error: null,
  });

  const processAttendance = useCallback(
    async (params: { memberId?: number; memberQr?: string }) => {
      setState({ loading: true, result: null, error: null });
      try {
        const response = await markAttendance(token, params);
        if (response.response_code === 200 && response.data?.EventMember) {
          setState({ loading: false, result: response.data.EventMember, error: null });
        } else {
          setState({
            loading: false,
            result: null,
            error: response.response_message || 'Member not found or not registered for this event.',
          });
        }
      } catch {
        setState({ loading: false, result: null, error: 'Network error. Please try again.' });
      }
    },
    [token]
  );

  const clearResult = useCallback(() => {
    setState({ loading: false, result: null, error: null });
  }, []);

  return { ...state, processAttendance, clearResult };
}
