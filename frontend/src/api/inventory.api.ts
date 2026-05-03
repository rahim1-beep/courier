import { apiClient } from './axios';
import { Inventory, PaginatedResponse, PaginationQuery } from '../types';

export const inventoryApi = {
  findAll: async (params: PaginationQuery & { branchId?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<Inventory>>('/inventory', { params });
    return data;
  },
  
  findOne: async (id: string) => {
    const { data } = await apiClient.get<Inventory>(`/inventory/${id}`);
    return data;
  },
  
  create: async (payload: { branchId: string; notes?: string; items: any[] }) => {
    const { data } = await apiClient.post<Inventory>('/inventory', payload);
    return data;
  },
  
  bulkUpload: async (file: File, branchId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await apiClient.post<any>(
      `/inventory/bulk-upload?branchId=${branchId}`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return data;
  }
};
