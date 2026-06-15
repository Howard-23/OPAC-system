import { create } from 'zustand';
import { invoke } from '../lib/runtimeBridge';

export interface Patron {
  name: string;
  idno: string;
  group_name: string;
  expiry: string | null;
  dept: string | null;
  phone: string | null;
  email: string | null;
  unpaid_fine: number;
}

interface PatronState {
  patrons: Patron[];
  selectedIdno: string | null;
  isLoading: boolean;
  error: string | null;
  setSelectedIdno: (idno: string | null) => void;
  fetchPatrons: () => Promise<void>;
  addPatron: (patron: Patron) => Promise<void>;
  updatePatron: (idno: string, patron: Patron) => Promise<void>;
  deletePatron: (idno: string) => Promise<void>;
  payFine: (idno: string, amount: number) => Promise<void>;
}

export const usePatronStore = create<PatronState>((set, get) => ({
  patrons: [],
  selectedIdno: null,
  isLoading: false,
  error: null,
  setSelectedIdno: (idno) => set({ selectedIdno: idno }),
  fetchPatrons: async () => {
    set({ isLoading: true });
    try {
      const patrons = await invoke<Patron[]>('get_patrons');
      set({ patrons, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },
  addPatron: async (patron) => {
    try {
      await invoke('add_patron', { patron });
      await get().fetchPatrons();
    } catch (e) {
      alert(`Add failed: ${e}`);
    }
  },
  updatePatron: async (idno, patron) => {
    try {
      await invoke('update_patron', { idno, patron });
      await get().fetchPatrons();
    } catch (e) {
      alert(`Update failed: ${e}`);
    }
  },
  deletePatron: async (idno) => {
    try {
      await invoke('delete_patron', { idno });
      set((state) => ({
        patrons: state.patrons.filter(p => p.idno !== idno),
        selectedIdno: state.selectedIdno === idno ? null : state.selectedIdno
      }));
    } catch (e) {
      alert(`Delete failed: ${e}`);
    }
  },
  payFine: async (idno, amount) => {
    try {
      await invoke('pay_fine', { idno, amount });
      set((state) => ({
        patrons: state.patrons.map(p =>
          p.idno === idno ? { ...p, unpaid_fine: Math.max(0, p.unpaid_fine - amount) } : p
        ),
      }));
    } catch (e) {
      alert(`Payment failed: ${e}`);
    }
  },
}));
