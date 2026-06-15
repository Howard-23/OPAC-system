import { create } from 'zustand';
import { invoke } from '../lib/runtimeBridge';

export interface AuditResult {
  accession: string;
  title: string;
  location: string;
  status: string;
  last_audit: string | null;
}

interface AuditState {
  scannedItems: AuditResult[];
  isScanning: boolean;
  error: string | null;
  startScanning: () => void;
  stopScanning: () => void;
  scanItem: (accession: string) => Promise<void>;
  clearSession: () => void;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  scannedItems: [],
  isScanning: false,
  error: null,

  startScanning: () => set({ isScanning: true, error: null }),
  stopScanning: () => set({ isScanning: false }),

  scanItem: async (accession: string) => {
    try {
      const result = await invoke<AuditResult>('audit_item', { accession });
      
      // Check if already in current session to avoid duplicates (optional but good for UX)
      const exists = get().scannedItems.some(item => item.accession === accession);
      if (!exists) {
        set(state => ({
          scannedItems: [result, ...state.scannedItems],
          error: null
        }));
      } else {
        set({ error: `Item ${accession} already scanned in this session.` });
      }
    } catch (err: any) {
      set({ error: err.toString() });
    }
  },

  clearSession: () => set({ scannedItems: [], error: null })
}));
