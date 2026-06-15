import React, { useState, useEffect } from 'react';
import { ImageEditorDialog } from '../../components/settings/ImageEditorDialog';
import { Channel, convertFileSrc, getApiBaseUrl, invoke, isDesktopRuntime } from '../../lib/runtimeBridge';
import { useThemeStore } from '../../stores/themeStore';

export const SettingsPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tab, setTab] = useState<'db' | 'ai' | 'branding' | 'display'>('db');
  const { mode, setMode } = useThemeStore();

  // DB State
  const [dbUrl, setDbUrl] = useState('');
  const [dbStatus, setDbStatus] = useState('');
  const [dbTesting, setDbTesting] = useState(false);

  // AI State
  const [aiStatus, setAiStatus] = useState('');
  const [aiProgress, setAiProgress] = useState('');
  const [aiPulling, setAiPulling] = useState(false);
  const [phi3Ready, setPhi3Ready] = useState(false);
  const [embedReady, setEmbedReady] = useState(false);

  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [tempSelectedLogo, setTempSelectedLogo] = useState<string | null>(null);

  useEffect(() => {
    loadDbConfig();
    checkAiModels();
    loadLogo();
  }, []);

  const loadLogo = async () => {
    try {
      const path = await invoke<string | null>('get_logo_path');
      setLogoPath(path);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogoUpload = async () => {
    try {
      if (!isDesktopRuntime()) {
        throw new Error('Branding changes are only available in the desktop app.');
      }

      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        filters: [{ name: 'Image', extensions: ['png', 'jpg', 'jpeg', 'svg'] }],
        multiple: false
      });
      if (selected && typeof selected === 'string') {
        setTempSelectedLogo(selected);
      }
    } catch (e) {
      setDbStatus(`Selection failed: ${e}`);
    }
  };

  const loadDbConfig = async () => {
    setDbUrl(getApiBaseUrl());
  };

  const testConnection = async () => {
    setDbTesting(true);
    setDbStatus('Testing connection...');
    try {
      const msg = await invoke<string>('check_db_connection');
      setDbStatus(`✓ ${msg}`);
    } catch (err) {
      setDbStatus(`✗ ${err}`);
    } finally {
      setDbTesting(false);
    }
  };

  const saveDbConfig = async () => {
    setDbStatus('Shared database settings are managed on Railway. Set VITE_API_BASE_URL before building the app.');
  };

  const handleExport = async () => {
    try {
      if (!isDesktopRuntime()) {
        throw new Error('Settings export is only available in the desktop app.');
      }

      const { save } = await import('@tauri-apps/plugin-dialog');
      const filePath = await save({
        filters: [{ name: 'Config', extensions: ['json'] }],
        defaultPath: 'infolib_config.json'
      });
      if (filePath) {
        await invoke('export_settings', { exportPath: filePath });
        setDbStatus('Settings exported successfully.');
      }
    } catch (e) {
      setDbStatus(`Export failed: ${e}`);
    }
  };

  const handleImport = async () => {
    try {
      if (!isDesktopRuntime()) {
        throw new Error('Settings import is only available in the desktop app.');
      }

      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        filters: [{ name: 'Config', extensions: ['json'] }],
        multiple: false
      });
      if (selected && typeof selected === 'string') {
        await invoke('import_settings', { importPath: selected });
        setDbStatus('Settings imported. Restart app to apply.');
        loadDbConfig();
      }
    } catch (e) {
      setDbStatus(`Import failed: ${e}`);
    }
  };

  const checkAiModels = async () => {
    try {
      setAiStatus('Checking AI models...');
      const hasPhi3 = await invoke<boolean>('check_ollama_model', { model: 'phi3' });
      const hasEmbed = await invoke<boolean>('check_ollama_model', { model: 'nomic-embed-text' });
      setPhi3Ready(hasPhi3);
      setEmbedReady(hasEmbed);
      if (hasPhi3 && hasEmbed) {
        setAiStatus('All AI models ready.');
      } else {
        setAiStatus('Some models are missing. Click "Pull" to download.');
      }
    } catch (err) {
      setAiStatus(`Ollama not reachable: ${err}`);
    }
  };

  const pullModel = async (model: string) => {
    setAiPulling(true);
    setAiProgress('');
    try {
      setAiStatus(`Downloading ${model}...`);
      const onProgress = new Channel<string>();
      onProgress.onmessage = (msg) => setAiProgress(msg);
      await invoke('pull_ollama_model', { model, onProgress });
      setAiProgress('');
      setAiStatus(`${model} downloaded.`);
      checkAiModels();
    } catch (err) {
      setAiStatus(`Download failed: ${err}`);
    } finally {
      setAiPulling(false);
    }
  };

  const tabClass = (t: string) =>
    `px-4 py-1 text-sm font-bold cursor-pointer ${
      tab === t
        ? 'bg-[#D4D0C8] dark:bg-dark-surface border-t-2 border-l-2 border-white dark:border-dark-highlight border-b-0 border-r-2 border-r-gray-800 dark:border-r-dark-shadow -mb-[1px] relative z-10'
        : 'bg-[#b0b0b0] dark:bg-dark-panel border-t border-l border-white dark:border-dark-highlight border-b border-r border-gray-800 dark:border-dark-shadow'
    }`;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
      <div className="bg-[#D4D0C8] dark:bg-dark-surface border-t-2 border-l-2 border-white dark:border-dark-highlight border-b-2 border-r-2 border-gray-800 dark:border-dark-shadow w-[580px] shadow-2xl animate-fade-in">
        {/* Title Bar */}
        <div className="title-bar-gjc">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙</span>
            <span>infoLib Settings</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-gray-800 text-[10px] font-bold leading-none hover:bg-red-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex px-4 pt-3 gap-1">
          <div className={tabClass('db')} onClick={() => setTab('db')}>Database</div>
          <div className={tabClass('ai')} onClick={() => setTab('ai')}>AI Engine</div>
          <div className={tabClass('branding')} onClick={() => setTab('branding')}>Branding</div>
          <div className={tabClass('display')} onClick={() => setTab('display')}>Display</div>
        </div>

        {/* Tab Content */}
        <div className="mx-4 mb-4 p-5 bg-[#D4D0C8] dark:bg-dark-surface border-t-2 border-white dark:border-dark-highlight border-l-2 border-white dark:border-dark-highlight border-b-2 border-gray-600 dark:border-dark-shadow border-r-2 border-gray-600 dark:border-dark-shadow shadow-inner min-h-[300px]">
          {tab === 'db' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-dark-text">Shared API URL:</label>
                <input
                  type="text"
                  value={dbUrl}
                  readOnly
                  className="w-full border-2 border-gray-600 dark:border-dark-border-dark border-t-gray-800 dark:border-t-dark-shadow border-l-gray-800 dark:border-l-dark-shadow p-2 bg-white dark:bg-dark-input text-sm font-mono shadow-inner focus:ring-1 ring-[#A6CAF0] dark:ring-dark-accent outline-none dark:text-dark-text dark:placeholder-dark-text-muted"
                  placeholder="https://your-service.up.railway.app/api"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={testConnection}
                  disabled={dbTesting}
                  className="px-4 py-1.5 text-xs font-bold bg-[#c0c0c0] dark:bg-dark-panel dark:text-dark-text border-t-2 border-l-2 border-white dark:border-dark-highlight border-b-2 border-r-2 border-gray-800 dark:border-dark-shadow hover:bg-[#d4d0c8] dark:hover:bg-dark-surface-alt active:border-inset disabled:opacity-50 transition-colors"
                >
                  {dbTesting ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  onClick={saveDbConfig}
                  className="btn-gjc px-6 py-1.5 text-xs"
                >
                  How To Change
                </button>
              </div>

              {dbStatus && (
                <div className={`p-3 text-xs border-2 border-gray-600 border-t-gray-800 border-l-gray-800 ${dbStatus.includes('✓') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} font-bold shadow-inner`}>
                  {dbStatus}
                </div>
              )}

              <div className="border-t border-gray-400 pt-4 mt-2">
                <p className="text-[10px] font-bold mb-2 uppercase tracking-wider text-gray-500 dark:text-dark-text-muted">Security & Backups</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="px-4 py-1 text-xs bg-[#c0c0c0] dark:bg-dark-panel dark:text-dark-text border-t-2 border-l-2 border-white dark:border-dark-highlight border-b-2 border-r-2 border-gray-800 dark:border-dark-shadow hover:bg-[#d4d0c8] dark:hover:bg-dark-surface-alt active:border-inset transition-colors"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={handleImport}
                    className="px-4 py-1 text-xs bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 hover:bg-[#d4d0c8] active:border-inset transition-colors"
                  >
                    Import JSON
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'ai' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-xs font-bold mb-1 text-gray-700 dark:text-dark-text">Ollama AI Runtime Status</div>

              <div className="bg-white dark:bg-dark-input border-2 border-gray-600 dark:border-dark-border-dark border-t-gray-800 dark:border-t-dark-shadow border-l-gray-800 dark:border-l-dark-shadow shadow-inner overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 dark:bg-dark-surface border-b border-gray-300 dark:border-dark-border-dark">
                    <tr>
                      <th className="text-left px-3 py-2 font-bold text-gray-600 dark:text-dark-text-muted">Model</th>
                      <th className="text-left px-3 py-2 font-bold text-gray-600 dark:text-dark-text-muted">Utility</th>
                      <th className="text-center px-3 py-2 font-bold text-gray-600 dark:text-dark-text-muted">State</th>
                      <th className="text-right px-3 py-2 font-bold text-gray-600 dark:text-dark-text-muted">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-dark-border-dark hover:bg-blue-50/30 dark:hover:bg-dark-selection/30">
                      <td className="px-3 py-2 font-mono dark:text-dark-text">phi3</td>
                      <td className="px-3 py-2 dark:text-dark-text">Conversational</td>
                      <td className={`px-3 py-2 text-center font-bold ${phi3Ready ? 'text-green-600' : 'text-red-500'}`}>{phi3Ready ? 'Ready' : 'Missing'}</td>
                      <td className="px-3 py-2 text-right">
                        {!phi3Ready && (
                          <button
                            onClick={() => pullModel('phi3')}
                            disabled={aiPulling}
                            className="btn-gjc px-3 py-0.5 text-[10px]"
                          >
                            Pull
                          </button>
                        )}
                      </td>
                    </tr>
                    <tr className="hover:bg-blue-50/30 dark:hover:bg-dark-selection/30">
                      <td className="px-3 py-2 font-mono dark:text-dark-text">nomic-embed</td>
                      <td className="px-3 py-2 dark:text-dark-text">Vector Search</td>
                      <td className={`px-3 py-2 text-center font-bold ${embedReady ? 'text-green-600' : 'text-red-500'}`}>{embedReady ? 'Ready' : 'Missing'}</td>
                      <td className="px-3 py-2 text-right">
                        {!embedReady && (
                          <button
                            onClick={() => pullModel('nomic-embed-text')}
                            disabled={aiPulling}
                            className="btn-gjc px-3 py-0.5 text-[10px]"
                          >
                            Pull
                          </button>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {aiProgress && (
                <div>
                  <div className="w-full bg-gray-200 h-2 border-2 border-gray-600 border-t-gray-800 border-l-gray-800 overflow-hidden">
                    <div className="bg-[#A6CAF0] h-full animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{aiProgress}</p>
                </div>
              )}

              {aiStatus && (
                <div className="bg-white dark:bg-dark-input border-2 border-gray-600 dark:border-dark-border-dark border-t-gray-800 dark:border-t-dark-shadow border-l-gray-800 dark:border-l-dark-shadow p-2 text-xs dark:text-dark-text">
                  {aiStatus}
                </div>
              )}

              <button
                onClick={checkAiModels}
                disabled={aiPulling}
                className="px-3 py-1 text-xs font-bold bg-[#c0c0c0] dark:bg-dark-panel dark:text-dark-text border-t-2 border-l-2 border-white dark:border-dark-highlight border-b-2 border-r-2 border-gray-800 dark:border-dark-shadow hover:bg-[#d4d0c8] dark:hover:bg-dark-surface-alt active:border-inset disabled:opacity-50"
              >
                Refresh Status
              </button>
            </div>
          )}

          {tab === 'branding' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-dark-text mb-2">Application Logo</h3>
                <p className="text-[10px] text-gray-500 dark:text-dark-text-muted mb-4 uppercase tracking-tighter">Recommended: 128x128 PNG with transparency</p>
                
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white/50 dark:bg-dark-input border-2 border-gray-400 dark:border-dark-border-dark border-t-gray-600 dark:border-t-dark-shadow border-l-gray-600 dark:border-l-dark-shadow flex items-center justify-center relative overflow-hidden shadow-inner">
                    {logoPath ? (
                      <img 
                        src={convertFileSrc(logoPath)} 
                        alt="App Logo" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[#A6CAF0]/20 rounded-full flex items-center justify-center border-2 border-[#A6CAF0]/50">
                        <span className="text-[#000080]/50 text-xl font-bold italic">LIB</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleLogoUpload}
                      className="btn-gjc px-4 py-2 text-xs flex items-center gap-2"
                    >
                      <span>📁</span> Change Logo
                    </button>
                    <p className="text-[10px] text-gray-400 dark:text-dark-text-muted italic">Select a new image file to replace the default institution logo.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-300 dark:border-dark-border-light pt-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-dark-text mb-2">Institution Identity</h3>
                <div className="bg-gray-100 dark:bg-dark-panel p-3 border-2 border-gray-400 dark:border-dark-border-dark border-t-gray-600 dark:border-t-dark-shadow border-l-gray-600 dark:border-l-dark-shadow text-xs text-gray-600 dark:text-dark-text-muted italic">
                   Branding options are applied globally across the application. These changes will be visible on the Login screen and Dashboard.
                </div>
              </div>
            </div>
          )}

          {tab === 'display' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-dark-text mb-1">Appearance</h3>
                <p className="text-[10px] text-gray-500 dark:text-dark-text-muted mb-4 uppercase tracking-tighter">Select your preferred color scheme</p>
              </div>

              <div className="bg-white dark:bg-dark-input border-2 border-gray-600 dark:border-dark-border-dark border-t-gray-800 dark:border-t-dark-shadow border-l-gray-800 dark:border-l-dark-shadow shadow-inner p-4 space-y-3">
                {([['light', '☀️', 'Light', 'Classic Windows 95/98 appearance'], ['dark', '🌙', 'Dark', 'Dark Win95/98 style — easy on the eyes'], ['system', '💻', 'System', 'Follow operating system preference']] as const).map(([value, icon, label, desc]) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 p-2.5 cursor-pointer border-2 transition-all duration-150 ${
                      mode === value
                        ? 'border-[#A6CAF0] dark:border-dark-accent bg-blue-50/50 dark:bg-dark-selection/30'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-dark-panel/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={value}
                      checked={mode === value}
                      onChange={() => setMode(value)}
                      className="accent-[#000080] dark:accent-dark-accent w-4 h-4"
                    />
                    <span className="text-base">{icon}</span>
                    <div>
                      <div className="text-sm font-bold text-black dark:text-dark-text">{label}</div>
                      <div className="text-[10px] text-gray-500 dark:text-dark-text-muted">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="border-t border-gray-300 dark:border-dark-border-light pt-4">
                <div className="bg-gray-100 dark:bg-dark-panel p-3 border-2 border-gray-400 dark:border-dark-border-dark border-t-gray-600 dark:border-t-dark-shadow border-l-gray-600 dark:border-l-dark-shadow text-xs text-gray-600 dark:text-dark-text-muted italic">
                  Theme preference is saved locally and applied instantly across the entire application.
                </div>
              </div>
            </div>
          )}
        </div>

        {tempSelectedLogo && (
          <ImageEditorDialog 
            sourcePath={tempSelectedLogo} 
            onClose={() => setTempSelectedLogo(null)} 
            onSaved={() => {
              setTempSelectedLogo(null);
              loadLogo();
              setDbStatus('Branding logo optimized and saved.');
            }}
          />
        )}
      </div>
    </div>
  );
};
