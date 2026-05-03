import { apiClient } from './axios';
import { Customer, PaginatedResponse, PaginationQuery } from '../types';

export const customersApi = {
  findAll: async (params: PaginationQuery) => {
    const { data } = await apiClient.get<PaginatedResponse<Customer>>('/customers', { params });
    return data;
  },
  
  findOne: async (id: string) => {
    const { data } = await apiClient.get<Customer>(`/customers/${id}`);
    return data;
  },
  
  create: async (payload: Partial<Customer> & { email: string; password?: string }) => {
    const { data } = await apiClient.post<Customer>('/customers', payload);
    return data;
  },
  
  update: async (id: string, payload: Partial<Customer>) => {
    const { data } = await apiClient.patch<Customer>(`/customers/${id}`, payload);
    return data;
  },
  
  remove: async (id: string) => {
    const { data } = await apiClient.delete<{ success: boolean }>(`/customers/${id}`);
    return data;
  },
  
  getDashboard: async (id: string) => {
    const { data } = await apiClient.get<any>(`/customers/${id}/dashboard`);
    return data;
  }
};
