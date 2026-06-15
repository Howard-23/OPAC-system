import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { invoke, isDesktopRuntime } from '../lib/runtimeBridge';
import { DESKTOP_RUNTIME_MESSAGE } from '../utils/tauriRuntime';

export type UiVersion = 'v1' | 'v2';

export interface AuthUser {
  username: string;
  displayName: string;
  idno?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  primaryRole: string;
  roles: string[];
}

interface AuthSession {
  user: AuthUser;
  permissions: string[];
  expiresAt: number;
}

interface AuthState {
  isAuthenticated: boolean;
  hasCheckedSession: boolean;
  isBootstrapping: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  permissions: string[];
  sessionExpiresAt: number | null;
  uiVersion: UiVersion;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  restoreSession: () => Promise<void>;
  setUiVersion: (uiVersion: UiVersion) => void;
  hasPermission: (permission: string | string[], mode?: 'all' | 'any') => boolean;
}

const STORAGE_KEY = 'infolib-auth-store';

const normalizeInvokeError = (error: unknown, fallback: string): string => {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes('__TAURI_INTERNALS__') ||
    message.includes('reading \'invoke\'') ||
    message.includes('reading "invoke"') ||
    message.includes('window.__TAURI_INTERNALS__')
  ) {
    return fallback;
  }

  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'Shared web API is not reachable. Start `npm --prefix server run dev` and try again.';
  }

  return message;
};

const applySession = (session: AuthSession | null) =>
  session
    ? {
        isAuthenticated: true,
        user: session.user,
        permissions: session.permissions,
        sessionExpiresAt: session.expiresAt,
      }
    : {
        isAuthenticated: false,
        user: null,
        permissions: [],
        sessionExpiresAt: null,
      };

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      hasCheckedSession: false,
      isBootstrapping: true,
      isLoading: false,
      user: null,
      permissions: [],
      sessionExpiresAt: null,
      uiVersion: 'v1',
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null });

        try {
          const session = await invoke<AuthSession>('login', { username, password });

          set({
            ...applySession(session),
            isLoading: false,
            hasCheckedSession: true,
            isBootstrapping: false,
          });

          if (isDesktopRuntime()) {
            try {
              await invoke('maximize_window');
            } catch (windowError) {
              console.error('Tauri invoke failed:', windowError);
            }
          }

          return true;
        } catch (error) {
          set({
            ...applySession(null),
            isLoading: false,
            hasCheckedSession: true,
            isBootstrapping: false,
            error: normalizeInvokeError(error, DESKTOP_RUNTIME_MESSAGE),
          });
          return false;
        }
      },

      loginWithGoogle: async () => {
        set({
          error: isDesktopRuntime()
            ? 'Google login is not enabled in the current Tauri build.'
            : 'Google login is not enabled in web mode for this build.',
          hasCheckedSession: true,
          isBootstrapping: false,
        });
        return false;
      },

      logout: () => {
        set({
          ...applySession(null),
          error: null,
          hasCheckedSession: true,
          isBootstrapping: false,
        });

        void invoke('logout').catch((error) => {
          console.error('Tauri logout failed:', normalizeInvokeError(error, DESKTOP_RUNTIME_MESSAGE));
        });

        if (isDesktopRuntime()) {
          void invoke('reset_window_size').catch((error) => {
            console.error('Tauri reset failed:', normalizeInvokeError(error, DESKTOP_RUNTIME_MESSAGE));
          });
        }
      },

      clearError: () => set({ error: null }),

      restoreSession: async () => {
        if (get().hasCheckedSession && !get().isBootstrapping) {
          return;
        }

        set({ isBootstrapping: true });

        try {
          const session = await invoke<AuthSession | null>('get_current_session');
          set({
            ...applySession(session),
            hasCheckedSession: true,
            isBootstrapping: false,
          });
        } catch (error) {
          set({
            ...applySession(null),
            hasCheckedSession: true,
            isBootstrapping: false,
            error: normalizeInvokeError(error, ''),
          });
        }
      },

      setUiVersion: (uiVersion) => set({ uiVersion }),

      hasPermission: (permission, mode = 'all') => {
        const permissionList = Array.isArray(permission) ? permission : [permission];
        const granted = get().permissions;

        if (permissionList.length === 0) {
          return true;
        }

        return mode === 'any'
          ? permissionList.some((value) => granted.includes(value))
          : permissionList.every((value) => granted.includes(value));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ uiVersion: state.uiVersion }),
    },
  ),
);
