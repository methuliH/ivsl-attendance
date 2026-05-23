export interface Employee {
  employee_id: string;
  employee_firstname: string;
  employee_lastname: string;
  employee_email: string;
  employee_app_token: string;
  employee_status: string;
}

export interface LoginResponse {
  response_code: number;
  response_message?: string;
  data?: {
    Employee: Employee;
  };
}

export interface Event {
  event_id: number;
  event_year: number;
  event_title: string;
  event_description: string;
  event_start: string;
  event_end: string;
  event_cpds: number;
  event_type: string;
  event_status: string;
}

export interface EventResponse {
  response_code: number;
  response_message?: string;
  data?: {
    Event: Event;
  };
}

export interface EventMember {
  event_id: string;
  member_idnumber: number;
  member_name: string;
  em_paystatus: string;
  em_status: string;
  em_checkin: string;
  em_checkout: string | null;
  em_cpds: string;
  em_remarks: string;
}

export interface AttendanceResponse {
  response_code: number;
  response_message?: string;
  data?: {
    EventMember: EventMember;
  };
}
