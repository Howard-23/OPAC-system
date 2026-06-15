import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BeveledBox } from '../../components/common/BeveledBox';
import { ErrorDialog } from '../../components/auth/ErrorDialog';
import { useAuth } from '../../hooks/useAuth';
import { convertFileSrc, invoke, isDesktopRuntime, isWebRuntime } from '../../lib/runtimeBridge';
import { DESKTOP_RUNTIME_MESSAGE, hasTauriInvoke, isTauriShell } from '../../utils/tauriRuntime';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isLoading, error, clearError, uiVersion, setUiVersion } = useAuth();
  const setupRequired = error === 'Database not connected. Please complete setup.';
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [tauriShellDetected, setTauriShellDetected] = useState(() => isTauriShell());
  const [tauriRuntimeAvailable, setTauriRuntimeAvailable] = useState(() => hasTauriInvoke());
  const desktopRuntimeReady = tauriRuntimeAvailable;
  const desktopBridgeStarting = tauriShellDetected && !desktopRuntimeReady;
  const browserDevMode = isWebRuntime();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (tauriRuntimeAvailable) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 20;
    const timer = window.setInterval(() => {
      setTauriShellDetected(isTauriShell());

      if (hasTauriInvoke()) {
        setTauriRuntimeAvailable(true);
        window.clearInterval(timer);
        return;
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        window.clearInterval(timer);
      }
    }, 150);

    return () => window.clearInterval(timer);
  }, [tauriRuntimeAvailable]);

  const [logoPath, setLogoPath] = useState<string | null>(null);

  useEffect(() => {
    const loadLogo = async () => {
      if (!isDesktopRuntime()) return;
      try {
        const path = await invoke<string | null>('get_logo_path');
        setLogoPath(path);
      } catch (e) {
        console.error(e);
      }
    };
    loadLogo();
  }, [tauriShellDetected]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading || desktopBridgeStarting) return;
    
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
  };

  const handleGoogleLogin = async () => {
    if (isLoading || !isOnline || !desktopRuntimeReady) return;
    const success = await loginWithGoogle();
    if (success) {
      navigate('/dashboard');
    }
  };

  const socialLoginEnabled = import.meta.env.VITE_ENABLE_SOCIAL_LOGIN === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#404040] dark:bg-[#1A1A1A]">
      <BeveledBox className="w-[520px] min-h-[380px] h-auto flex flex-col overflow-hidden animate-fade-in" padding="p-0">
        {/* Title Bar */}
        <div className="title-bar-gjc">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/20 border border-white/40 flex items-center justify-center text-[10px] text-white font-bold">L</div>
            <span>System Login</span>
          </div>
          <div className="flex gap-1">
             <button className="w-5 h-5 bg-[#c0c0c0] border border-gray-800 flex items-center justify-center text-black text-xs hover:bg-gray-100">_</button>
             <button className="w-5 h-5 bg-[#c0c0c0] border border-gray-800 flex items-center justify-center text-black text-xs hover:bg-red-500 hover:text-white">✕</button>
          </div>
        </div>

        {/* Top Branding Section */}
        <div className="h-[180px] flex-shrink-0 relative overflow-hidden bg-gradient-to-b from-[#A6CAF0] to-[#7FA8E0] dark:from-[#1E3A6E] dark:to-[#2A4F8A]">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
          
          <div className="absolute left-8 top-1/2 -translate-y-1/2">
             <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/30 overflow-hidden">
                {logoPath ? (
                  <img 
                    src={convertFileSrc(logoPath)} 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-white/50 text-2xl font-bold italic">LIB</span>
                )}
             </div>
          </div>

          <div className="absolute right-10 bottom-8 text-right">
            <h1 className="text-5xl font-sans font-bold text-white tracking-tighter leading-none drop-shadow-lg">infoLib.</h1>
            <div className="h-[3px] bg-white w-full mt-2 mb-1 shadow-md"></div>
            <p className="text-xs font-sans text-white font-bold uppercase tracking-widest opacity-80">Library Information System</p>
          </div>
        </div>

        {/* Bottom Login Form Section */}
        <div className="flex-grow bg-classic-grey dark:bg-dark-surface flex items-center justify-center">
          <form onSubmit={handleLogin}>
            <BeveledBox variant="sunken" className="bg-[#E0E0E0] dark:bg-dark-surface-alt w-[380px] p-8 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-sans text-black dark:text-dark-text">User Name</label>
                <input 
                  type="text" 
                  className="input-classic flex-grow" 
                  autoFocus 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-sans text-black dark:text-dark-text">Password</label>
                <input 
                  type="password" 
                  className="input-classic flex-grow" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="rounded-sm border border-[#B0B0B0] bg-[#F1F1F1] p-3 shadow-[1px_1px_0_#FFFFFF_inset,-1px_-1px_0_#B0B0B0_inset] dark:border-dark-border-light dark:bg-dark-surface-alt dark:shadow-[1px_1px_0_#5A5A5A_inset,-1px_-1px_0_#1A1A1A_inset]">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#404040] dark:text-dark-text-muted">
                  Interface
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className={`flex cursor-pointer items-start gap-2 rounded-sm border px-3 py-2 text-xs ${uiVersion === 'v1' ? 'border-[#000080] bg-white dark:border-dark-accent dark:bg-dark-panel' : 'border-[#B8B8B8] bg-[#ECECEC] dark:border-dark-border-light dark:bg-dark-surface'}`}>
                    <input
                      type="radio"
                      name="uiVersion"
                      value="v1"
                      checked={uiVersion === 'v1'}
                      onChange={() => setUiVersion('v1')}
                      className="mt-0.5"
                    />
                    <span className="flex flex-col">
                      <span className="font-bold text-black dark:text-dark-text">v1 Classic</span>
                      <span className="text-[10px] text-[#505050] dark:text-dark-text-muted">Win95 parity shell</span>
                    </span>
                  </label>
                  <label className={`flex cursor-pointer items-start gap-2 rounded-sm border px-3 py-2 text-xs ${uiVersion === 'v2' ? 'border-[#0F766E] bg-white dark:border-cyan-400 dark:bg-dark-panel' : 'border-[#B8B8B8] bg-[#ECECEC] dark:border-dark-border-light dark:bg-dark-surface'}`}>
                    <input
                      type="radio"
                      name="uiVersion"
                      value="v2"
                      checked={uiVersion === 'v2'}
                      onChange={() => setUiVersion('v2')}
                      className="mt-0.5"
                    />
                    <span className="flex flex-col">
                      <span className="font-bold text-black dark:text-dark-text">v2 Modern</span>
                      <span className="text-[10px] text-[#505050] dark:text-dark-text-muted">Responsive shell + lazy chunks</span>
                    </span>
                  </label>
                </div>
              </div>

              {browserDevMode && (
                <div className="rounded-sm border border-[#5B84C4] bg-[#EAF4FF] px-3 py-2 text-[11px] font-bold leading-relaxed text-[#123C74] dark:border-[#5B84C4] dark:bg-[#15263C] dark:text-[#BFD9FF]">
                  <div>Browser mode uses the shared web API.</div>
                  <div className="mt-1 font-normal normal-case tracking-normal">
                    Start the API with <code>npm --prefix server run dev</code>. Desktop-only tools still require <code>npm run tauri:dev</code>.
                  </div>
                </div>
              )}

              {!browserDevMode && !tauriShellDetected && !tauriRuntimeAvailable && (
                <div className="rounded-sm border border-[#B78B35] bg-[#FFF7D8] px-3 py-2 text-[11px] font-bold leading-relaxed text-[#6E5200] dark:border-[#8C6A1A] dark:bg-[#3A2F14] dark:text-[#F5D88B]">
                  <div>{DESKTOP_RUNTIME_MESSAGE}</div>
                </div>
              )}

              {desktopBridgeStarting && (
                <div className="rounded-sm border border-[#B78B35] bg-[#FFF7D8] px-3 py-2 text-[11px] font-bold leading-relaxed text-[#6E5200] dark:border-[#8C6A1A] dark:bg-[#3A2F14] dark:text-[#F5D88B]">
                  Desktop bridge is still starting. Wait a moment, then try sign in again.
                </div>
              )}

              <div className="flex justify-end gap-2 mt-2">
                <button 
                  type="submit"
                  className={`btn-classic min-w-[80px] ${(desktopBridgeStarting || isLoading) ? 'opacity-50' : ''}`}
                  disabled={desktopBridgeStarting || isLoading}
                >
                  {isLoading ? '...' : browserDevMode ? 'Sign In' : desktopBridgeStarting ? 'Starting...' : 'OK'}
                </button>
                <button 
                  type="button"
                  className="btn-classic min-w-[80px]"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>

              {socialLoginEnabled && (
                <>
                  <div className="h-[1px] bg-gray-400 dark:bg-dark-border-light my-2 shadow-[0_1px_0_white] dark:shadow-[0_1px_0_#404040]" />
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className={`btn-classic w-full flex items-center justify-center gap-2 py-2 ${(isLoading || !isOnline || !desktopRuntimeReady) ? 'opacity-50' : ''}`}
                      onClick={handleGoogleLogin}
                      disabled={isLoading || !isOnline || !desktopRuntimeReady}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Sign in with Google
                    </button>
                    {!isOnline && (
                      <span className="text-[10px] text-red-600 dark:text-red-400 font-bold text-center leading-tight">
                        Logging in via email or social is impossible if internet is down.
                      </span>
                    )}
                  </div>
                </>
              )}
            </BeveledBox>
          </form>
        </div>
      </BeveledBox>

      {error && (
        <ErrorDialog 
          message={error} 
          onClose={clearError} 
          secondaryActionLabel={setupRequired ? 'Setup' : undefined}
          onSecondaryAction={
            setupRequired
              ? () => {
                  clearError();
                  navigate('/setup');
                }
              : undefined
          }
        />
      )}
    </div>
  );
};
