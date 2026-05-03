import { apiClient } from './axios';
import { PaginatedResponse, PaginationQuery } from '../types';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  loginTime: string;
  ipAddress: string;
  status: string;
  employee?: { name: string; branchId: string };
}

export const attendanceApi = {
  checkIn: async () => {
    const { data } = await apiClient.post<AttendanceRecord>('/attendance/check-in');
    return data;
  },
  
  getMyAttendance: async (params: PaginationQuery) => {
    const { data } = await apiClient.get<PaginatedResponse<AttendanceRecord>>('/attendance/my', { params });
    return data;
  },
  
  getAll: async (params: PaginationQuery & { employeeId?: string; date?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<AttendanceRecord>>('/attendance', { params });
    return data;
  }
};
