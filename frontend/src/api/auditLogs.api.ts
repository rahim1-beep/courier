import { apiClient } from './axios';
import { PaginatedResponse, PaginationQuery, AuditLog } from '../types';

export const auditLogsApi = {
  findAll: async (params?: PaginationQuery): Promise<PaginatedResponse<AuditLog>> => {
    const { data } = await apiClient.get('/audit-logs', { params });
    return data;
  },
  
  findOne: async (id: string): Promise<AuditLog> => {
    const { data } = await apiClient.get(`/audit-logs/${id}`);
    return data;
  },
};
