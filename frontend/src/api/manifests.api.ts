import { apiClient } from './axios';
import { Manifest, PaginatedResponse, PaginationQuery } from '../types';

export const manifestsApi = {
  findAll: async (params: PaginationQuery) => {
    const { data } = await apiClient.get<PaginatedResponse<Manifest>>('/manifests', { params });
    return data;
  },
  
  findOne: async (id: string) => {
    const { data } = await apiClient.get<Manifest & { shipments: any[] }>(`/manifests/${id}`);
    return data;
  },
  
  create: async (payload: Partial<Manifest> & { shipmentIds: string[] }) => {
    const { data } = await apiClient.post<Manifest>('/manifests', payload);
    return data;
  },
  
  bulkGenerate: async (payload: { shipmentIds: string[]; branchId: string }) => {
    const { data } = await apiClient.post<any>('/manifests/bulk-generate', payload);
    return data;
  }
};
