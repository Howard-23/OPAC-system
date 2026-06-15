import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  effectiveTheme: () => 'light' | 'dark';
}

const STORAGE_KEY = 'infolib-theme';

function getSystemPreference(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode: ThemeMode) {
  const resolved = mode === 'system' ? getSystemPreference() : mode;
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function loadSavedMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    // localStorage unavailable
  }
  return 'light';
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = loadSavedMode();

  // Apply on load
  applyTheme(initial);

  // Listen for system preference changes when mode is 'system'
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (get().mode === 'system') {
      applyTheme('system');
    }
  });

  return {
    mode: initial,
    setMode: (mode: ThemeMode) => {
      localStorage.setItem(STORAGE_KEY, mode);
      applyTheme(mode);
      set({ mode });
    },
    effectiveTheme: () => {
      const m = get().mode;
      return m === 'system' ? getSystemPreference() : m;
    },
  };
});
