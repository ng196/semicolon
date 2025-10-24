export interface User {
  id: number;
  name: string;
  email?: string;
  specialization: string;
  year: string;
  avatar: string;
  online?: boolean;
  sharedClasses?: string[];
  attendanceRate?: number;
  interests?: string[];
  lastSeen?: string;
  bio?: string;
  phone?: string;
  major?: string;
  minor?: string;
  clubs?: string[];
  courses?: string[];
}
