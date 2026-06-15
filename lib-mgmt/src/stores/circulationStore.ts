import { create } from 'zustand';
import { invoke } from '../lib/runtimeBridge';

export interface Circulation {
  accession: string;
  dte_borrow: string;
  dte_due: string;
  dte_return: string | null;
  fine_code: number | null;
  idno: string;
}

export interface OverdueItem {
  accession: string;
  title: string;
  patron_name: string;
  idno: string;
  due_date: string;
  days_overdue: number;
}

export interface CirculationStats {
  total_active: number;
  total_overdue: number;
  total_fines: number;
}

interface CirculationState {
  activeLoans: Circulation[];
  overdueItems: OverdueItem[];
  stats: CirculationStats | null;
  isLoading: boolean;
  error: string | null;
  fetchActiveLoans: (idno: string) => Promise<void>;
  fetchOverdueItems: () => Promise<void>;
  fetchStats: () => Promise<void>;
  checkOut: (idno: string, accession: string) => Promise<void>;
  returnItem: (accession: string) => Promise<number>;
}

export const useCirculationStore = create<CirculationState>((set, get) => ({
  activeLoans: [],
  overdueItems: [],
  stats: null,
  isLoading: false,
  error: null,
  fetchActiveLoans: async (idno) => {
    set({ isLoading: true });
    try {
      const loans = await invoke<Circulation[]>('get_active_loans', { idno });
      set({ activeLoans: loans, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },
  fetchOverdueItems: async () => {
    set({ isLoading: true });
    try {
      const overdueItems = await invoke<OverdueItem[]>('get_overdue_items');
      set({ overdueItems, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },
  fetchStats: async () => {
    try {
      const stats = await invoke<CirculationStats>('get_circulation_stats');
      set({ stats });
    } catch (e) {
      console.error('Stats fetch failed:', e);
    }
  },
  checkOut: async (idno, accession) => {
    set({ isLoading: true });
    try {
      await invoke('check_out_item', { idno, accession });
      await get().fetchActiveLoans(idno);
      set({ isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
      throw e;
    }
  },
  returnItem: async (accession) => {
    set({ isLoading: true });
    try {
      const fine = await invoke<number>('return_item', { accession });
      set({ isLoading: false });
      return fine;
    } catch (e) {
      set({ error: String(e), isLoading: false });
      throw e;
    }
  },
}));
