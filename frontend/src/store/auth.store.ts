import { create } from 'zustand';
import { Role } from '../types';

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setHydrated: () => void;
}

// accessToken kept in memory only — localStorage is XSS-vulnerable for enterprise financial data
// Ideally refreshToken would be an httpOnly cookie, but we keep it in memory for this implementation too.
// Note: If page refreshes, user will need to log in again since tokens are purely in memory.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrating: false,

  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
  setHydrated: () => set({ isHydrating: false }),
}));
