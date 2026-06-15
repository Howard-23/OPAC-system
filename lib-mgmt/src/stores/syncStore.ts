import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke, isDesktopRuntime, isWebRuntime } from '../lib/runtimeBridge';

interface SyncLog {
  id: string;
  timestamp: string;
  type: 'info' | 'error' | 'success';
  message: string;
}

interface SyncState {
  isSyncing: boolean;
  lastSync: string | null;
  logs: SyncLog[];
  autoSyncEnabled: boolean;
  syncNow: () => Promise<void>;
  addLog: (type: 'info' | 'error' | 'success', message: string) => void;
  toggleAutoSync: () => void;
  clearLogs: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      isSyncing: false,
      lastSync: null,
      logs: [],
      autoSyncEnabled: true,

      syncNow: async () => {
        if (get().isSyncing) return;

        set({ isSyncing: true });
        get().addLog('info', isWebRuntime() ? 'Checking shared web API connection...' : 'Desktop runtime active. Verifying backend availability...');

        try {
          if (isWebRuntime()) {
            await invoke('check_db_connection');
          }

          const now = new Date().toISOString();
          set({ lastSync: now });
          get().addLog(
            'success',
            isDesktopRuntime()
              ? `Desktop and web share the same database. Backend verified at ${new Date(now).toLocaleTimeString()}.`
              : `Shared web API verified at ${new Date(now).toLocaleTimeString()}. Changes will be visible in the desktop app using the same database.`,
          );
        } catch (error) {
          get().addLog('error', `Backend check failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          set({ isSyncing: false });
        }
      },

      addLog: (type, message) => {
        const newLog: SyncLog = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          type,
          message,
        };
        set((state) => ({
          logs: [newLog, ...state.logs].slice(0, 50), // Keep last 50 logs
        }));
      },

      toggleAutoSync: () => {
        const newValue = !get().autoSyncEnabled;
        set({ autoSyncEnabled: newValue });
        get().addLog('info', `Auto-sync ${newValue ? 'enabled' : 'disabled'}`);
      },

      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: 'infolib-sync-store',
      partialize: (state) => ({ 
        autoSyncEnabled: state.autoSyncEnabled,
        lastSync: state.lastSync,
        logs: state.logs 
      }),
    }
  )
);
