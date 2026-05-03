import { apiClient } from './axios';
import { AuditLog, PaginatedResponse, PaginationQuery } from '../types';

export const auditApi = {
  findAll: async (params: PaginationQuery & { userId?: string; entity?: string; startDate?: string; endDate?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs', { params });
    return data;
  }
};
