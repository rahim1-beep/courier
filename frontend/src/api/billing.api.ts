import { apiClient } from './axios';
import { Invoice, PaginatedResponse, PaginationQuery } from '../types';

export const billingApi = {
  findAll: async (params: PaginationQuery & { customerId?: string; status?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<Invoice>>('/invoices', { params });
    return data;
  },
  
  findOne: async (id: string) => {
    const { data } = await apiClient.get<Invoice>(`/invoices/${id}`);
    return data;
  },
  
  generateFromShipment: async (shipmentId: string) => {
    const { data } = await apiClient.post<Invoice>(`/invoices/generate/${shipmentId}`);
    return data;
  },
  
  getPdfData: async (id: string) => {
    const { data } = await apiClient.get<any>(`/invoices/${id}/pdf-data`);
    return data;
  },
  
  findByCustomer: async (customerId: string, params: PaginationQuery) => {
    const { data } = await apiClient.get<PaginatedResponse<Invoice>>(`/invoices/customer/${customerId}`, { params });
    return data;
  }
};
