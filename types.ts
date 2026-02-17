export type Role = 'student' | 'teacher';

export interface User {
  uid: string;
  nis: string;
  name: string;
  role: Role;
  class?: string; // Only for students
  level?: number;
  xp?: number;
  photo: string;
}

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Pending';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userClass: string;
  status: AttendanceStatus;
  type?: 'Sakit' | 'Izin'; // Stores the requested type when status is Pending
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  details?: string;
  attachmentUrl?: string; // URL for photo proof
  isVerified?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ScheduleItem {
  id: string;
  subject: string;
  time: string;
  room: string;
}

export interface TeacherNotification {
  id: string;
  type: 'permit_request';
  recordId: string;
  studentName: string;
  studentClass: string;
  date: string;
  isRead: boolean;
}