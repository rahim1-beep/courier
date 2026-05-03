import { apiClient } from './axios';
import { Service, Tariff, PaginatedResponse, PaginationQuery } from '../types';

export const tariffsApi = {
  findAllServices: async () => {
    const { data } = await apiClient.get<Service[]>('/services');
    return data;
  },
  
  createService: async (payload: Partial<Service> & { countries: any[] }) => {
    const { data } = await apiClient.post<Service>('/services', payload);
    return data;
  },
  
  updateService: async (id: string, payload: Partial<Service>) => {
    const { data } = await apiClient.patch<Service>(`/services/${id}`, payload);
    return data;
  },
  
  findAllTariffs: async (params: PaginationQuery & { serviceId?: string; countryCode?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<Tariff>>('/tariffs', { params });
    return data;
  },
  
  createTariff: async (payload: Partial<Tariff>) => {
    const { data } = await apiClient.post<Tariff>('/tariffs', payload);
    return data;
  },
  
  updateTariff: async (id: string, payload: Partial<Tariff>) => {
    const { data } = await apiClient.patch<Tariff>(`/tariffs/${id}`, payload);
    return data;
  },
  
  calculatePrice: async (payload: { serviceId: string; countryCode: string; weight: number; customerId?: string }) => {
    const { data } = await apiClient.post<any>('/tariffs/calculate', payload);
    return data;
  },
  
  createCustomerTariff: async (payload: any) => {
    const { data } = await apiClient.post<any>('/tariffs/customer', payload);
    return data;
  }
};
