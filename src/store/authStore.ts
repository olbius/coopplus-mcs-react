import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types/auth.types';

interface AuthStore extends AuthState {
  setAuth: (token: string, refreshToken: string, user: User, permissions: string[]) => void;
  updateToken: (token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  getUserPermissions: () => string[];
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      permissions: [],
      isAuthenticated: false,

      setAuth: (token, refreshToken, user, permissions) =>
        set({ token, refreshToken, user, permissions, isAuthenticated: true }),

      updateToken: (token) =>
        set({ token }),

      logout: () =>
        set({ token: null, refreshToken: null, user: null, permissions: [], isAuthenticated: false }),

      hasPermission: (permission) =>
        get().permissions.includes(permission) || get().permissions.includes('ADMIN'),

      hasAnyPermission: (permissions) => {
        const state = get();
        if (state.permissions.includes('ADMIN')) return true;
        return permissions.some(p => state.permissions.includes(p));
      },

      getUserPermissions: () => get().permissions,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
