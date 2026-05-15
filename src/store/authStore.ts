import { create } from 'zustand';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'offline' | 'update-required';

export interface User {
  id: string;
  username: string;
  email: string | null;
  phone_number: string;
  language: string;
  role: string;
}

interface AuthState {
  status: AuthStatus;
  user: User | null;
  offlineMode: boolean;
  sessionExpiryReason: string | null;

  // Actions
  setAuthenticated: (user: User) => void;
  setUnauthenticated: (reason?: string) => void;
  setOffline: (cachedUser: User | null) => void;
  setUpdateRequired: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  offlineMode: false,
  sessionExpiryReason: null,

  setAuthenticated: (user: User) => set({
    status: 'authenticated',
    user,
    offlineMode: false,
    sessionExpiryReason: null
  }),

  setUnauthenticated: (reason?: string) => set({
    status: 'unauthenticated',
    user: null,
    offlineMode: false,
    sessionExpiryReason: reason || null
  }),

  setOffline: (cachedUser: User | null) => set({
    status: 'offline',
    user: cachedUser,
    offlineMode: true
  }),

  setUpdateRequired: () => set({
    status: 'update-required'
  }),
}));
