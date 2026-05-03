import { apiClient } from './axios';
import { User } from '../types';

export const authApi = {
  login: async (credentials: Record<string, string>) => {
    const { data } = await apiClient.post<any>('/auth/login', credentials);
    return data;
  },
  
  logout: async () => {
    await apiClient.post('/auth/logout');
  },
  
  getProfile: async () => {
    const { data } = await apiClient.get<any>('/auth/me');
    return data;
  }
};
