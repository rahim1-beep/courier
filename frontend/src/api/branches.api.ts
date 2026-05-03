import { apiClient } from './axios';
import { Branch, PaginatedResponse, PaginationQuery } from '../types';

export const branchesApi = {
  findAll: async (params: PaginationQuery) => {
    const { data } = await apiClient.get<PaginatedResponse<Branch>>('/branches', { params });
    return data;
  },
  
  findOne: async (id: string) => {
    const { data } = await apiClient.get<Branch>(`/branches/${id}`);
    return data;
  },
  
  create: async (payload: Partial<Branch>) => {
    const { data } = await apiClient.post<Branch>('/branches', payload);
    return data;
  },
  
  update: async (id: string, payload: Partial<Branch>) => {
    const { data } = await apiClient.patch<Branch>(`/branches/${id}`, payload);
    return data;
  }
};
