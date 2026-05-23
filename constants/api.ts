import { LoginResponse, EventResponse, AttendanceResponse } from '../types/api';

const BASE_URL = 'https://ivsl.lk/api';

export async function login(username: string, password: string): Promise<LoginResponse> {
  const body = new FormData();
  body.append('username', username);
  body.append('password', password);

  const response = await fetch(`${BASE_URL}/employee_login`, {
    method: 'POST',
    body,
  });
  return response.json();
}

export async function getEvent(appToken: string): Promise<EventResponse> {
  const body = new FormData();
  body.append('app_token', appToken);

  const response = await fetch(`${BASE_URL}/event`, {
    method: 'POST',
    body,
  });
  return response.json();
}

export async function markAttendance(
  appToken: string,
  params: { memberId?: number; memberQr?: string }
): Promise<AttendanceResponse> {
  const body = new FormData();
  body.append('app_token', appToken);

  if (params.memberId !== undefined) {
    body.append('member_id', String(params.memberId));
  }
  if (params.memberQr !== undefined) {
    body.append('member_qr', params.memberQr);
  }

  const response = await fetch(`${BASE_URL}/event_attendance`, {
    method: 'POST',
    body,
  });
  return response.json();
}
