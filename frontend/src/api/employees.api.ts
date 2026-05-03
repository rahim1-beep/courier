import { apiClient } from './axios';
import { Employee, PaginatedResponse, PaginationQuery } from '../types';

export const employeesApi = {
  findAll: async (params: PaginationQuery & { branchId?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<Employee>>('/employees', { params });
    return data;
  },
  
  findOne: async (id: string) => {
    const { data } = await apiClient.get<Employee>(`/employees/${id}`);
    return data;
  },
  
  create: async (payload: Partial<Employee> & { email: string; password?: string }) => {
    const { data } = await apiClient.post<Employee>('/employees', payload);
    return data;
  },
  
  update: async (id: string, payload: Partial<Employee>) => {
    const { data } = await apiClient.patch<Employee>(`/employees/${id}`, payload);
    return data;
  },
  
  remove: async (id: string) => {
    const { data } = await apiClient.delete<{ success: boolean }>(`/employees/${id}`);
    return data;
  }
};
