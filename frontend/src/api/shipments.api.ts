import { apiClient } from './axios';
import { Shipment, ShipmentStatus, PaginatedResponse, PaginationQuery } from '../types';

export const shipmentsApi = {
  findAll: async (params: PaginationQuery & { branchId?: string; customerId?: string; status?: string; serviceId?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<Shipment>>('/shipments', { params });
    return data;
  },
  
  findOne: async (id: string) => {
    const { data } = await apiClient.get<Shipment>(`/shipments/${id}`);
    return data;
  },
  
  create: async (payload: any) => {
    const { data } = await apiClient.post<Shipment>('/shipments', payload);
    return data;
  },
  
  updateStatus: async (id: string, payload: { status: ShipmentStatus; note?: string; branchId?: string }) => {
    const { data } = await apiClient.patch<Shipment>(`/shipments/${id}/status`, payload);
    return data;
  },
  
  getTracking: async (id: string) => {
    const { data } = await apiClient.get<any>(`/shipments/${id}/tracking`);
    return data;
  },
  
  findByCustomer: async (customerId: string, params: PaginationQuery) => {
    const { data } = await apiClient.get<PaginatedResponse<Shipment>>(`/shipments/customer/${customerId}`, { params });
    return data;
  }
};
