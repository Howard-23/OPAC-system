type TauriWindow = Window & {
  isTauri?: boolean;
  __TAURI__?: {
    core?: {
      invoke?: unknown;
    };
  };
  __TAURI_INTERNALS__?: {
    invoke?: unknown;
  };
};

const getTauriWindow = (): TauriWindow | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window as TauriWindow;
};

export const DESKTOP_RUNTIME_MESSAGE =
  'Desktop runtime not detected. Launch the app with npm run tauri:dev or .\\tauri-dev.cmd to enable login and backend commands.';

export const hasTauriInvoke = (): boolean => {
  const tauriWindow = getTauriWindow();

  if (!tauriWindow) {
    return false;
  }

  return (
    typeof tauriWindow.__TAURI_INTERNALS__?.invoke === 'function' ||
    typeof tauriWindow.__TAURI__?.core?.invoke === 'function'
  );
};

export const isTauriShell = (): boolean => {
  const tauriWindow = getTauriWindow();

  if (!tauriWindow) {
    return false;
  }

  return Boolean(tauriWindow.isTauri || tauriWindow.__TAURI__ || tauriWindow.__TAURI_INTERNALS__);
};
