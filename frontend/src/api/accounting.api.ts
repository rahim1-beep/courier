import { apiClient } from './axios';
import { LedgerEntry, PaginatedResponse, PaginationQuery } from '../types';

export const accountingApi = {
  getLedger: async (params: PaginationQuery & { customerId?: string; branchId?: string; type?: string; startDate?: string; endDate?: string; showVoided?: boolean }) => {
    const { data } = await apiClient.get<PaginatedResponse<LedgerEntry>>('/accounting/ledger', { params });
    return data;
  },
  
  getCustomerBalance: async (customerId: string, params: any) => {
    const { data } = await apiClient.get<any>(`/accounting/customer-balance/${customerId}`, { params });
    return data;
  },
  
  getProfitLoss: async (params: { startDate?: string; endDate?: string; groupBy?: string }) => {
    const { data } = await apiClient.get<any>('/accounting/profit-loss', { params });
    return data;
  },
  
  getSalesSummary: async (params: { startDate?: string; endDate?: string }) => {
    const { data } = await apiClient.get<any>('/accounting/sales-summary', { params });
    return data;
  },
  
  recordPayment: async (payload: any) => {
    const { data } = await apiClient.post<any>('/accounting/payments', payload);
    return data;
  },
  
  issueCreditNote: async (payload: any) => {
    const { data } = await apiClient.post<any>('/accounting/credit-notes', payload);
    return data;
  },
  
  voidEntry: async (id: string, payload: { reason: string }) => {
    const { data } = await apiClient.post<any>(`/accounting/ledger/${id}/void`, payload);
    return data;
  },
  
  getOutstandingInvoices: async (params: PaginationQuery & { customerId?: string; minAmount?: number }) => {
    const { data } = await apiClient.get<any>('/accounting/outstanding-invoices', { params });
    return data;
  }
};
