import React, { useState, useEffect } from 'react';
import { Channel, invoke, isDesktopRuntime } from '../../lib/runtimeBridge';

export const SetupPage: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [status, setStatus] = useState<string>('Initializing setup...');
  const [dbUrl, setDbUrl] = useState<string>('postgres://postgres:password@localhost:5432/infolib');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [step, setStep] = useState<'db' | 'ai' | 'done'>('db');
  const [aiProgress, setAiProgress] = useState<string>('');

  useEffect(() => {
    if (step === 'db') checkConnection();
    if (step === 'ai') checkAiModels();
  }, [step]);

  const checkConnection = async () => {
    try {
      setStatus('Checking database connection...');
      const msg = await invoke<string>('check_db_connection');
      setStatus(msg);
      if (!isDesktopRuntime()) {
        setTimeout(onComplete, 1000);
        return;
      }
      setTimeout(() => setStep('ai'), 1000);
    } catch (err) {
      setStatus(
        isDesktopRuntime()
          ? `Database Failed: ${err}. Please configure or import backup.`
          : `Shared API failed: ${err}. Start the API locally or set VITE_API_BASE_URL to your Railway API.`,
      );
      setIsConfiguring(true);
      if (isDesktopRuntime()) {
        try {
          const config: any = await invoke('get_db_config');
          setDbUrl(config.database_url);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const checkAiModels = async () => {
    try {
      setStatus('Checking AI models (Phi-3 & Nomic)...');
      const hasPhi3 = await invoke<boolean>('check_ollama_model', { model: 'phi3' });
      const hasEmbed = await invoke<boolean>('check_ollama_model', { model: 'nomic-embed-text' });

      if (hasPhi3 && hasEmbed) {
        setStatus('AI Models ready.');
        setTimeout(onComplete, 1000);
      } else {
        const missing = !hasPhi3 ? 'phi3' : 'nomic-embed-text';
        downloadModel(missing);
      }
    } catch (err) {
      setStatus(`AI Check failed: ${err}. Is Ollama running?`);
      setIsConfiguring(true);
    }
  };

  const downloadModel = async (model: string) => {
    try {
      setStatus(`Downloading AI model: ${model}... (Resumable if connection drops)`);
      const onProgress = new Channel<string>();
      onProgress.onmessage = (msg) => setAiProgress(msg);
      
      await invoke('pull_ollama_model', { model, onProgress });
      setAiProgress('');
      checkAiModels(); // check again (might need the other one)
    } catch (err) {
      setStatus(`Download failed: ${err}. Please check internet and retry.`);
      setIsConfiguring(true);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await invoke('save_db_config', { config: { database_url: dbUrl } });
      setStatus('Saved. Retrying connection...');
      setIsConfiguring(false);
      checkConnection();
    } catch (e) {
      setStatus(`Save failed: ${e}`);
    }
  };

  const handleExport = async () => {
    try {
      if (!isDesktopRuntime()) {
        throw new Error('Setup export is only available in the desktop app.');
      }

      const { save } = await import('@tauri-apps/plugin-dialog');
      const filePath = await save({
        filters: [{ name: 'Config', extensions: ['json'] }],
        defaultPath: 'infolib_config.json'
      });
      if (filePath) {
        await invoke('export_settings', { exportPath: filePath });
        setStatus('Settings exported successfully.');
      }
    } catch (e) {
      setStatus(`Export failed: ${e}`);
    }
  };

  const handleImport = async () => {
    try {
      if (!isDesktopRuntime()) {
        throw new Error('Setup import is only available in the desktop app.');
      }

      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        filters: [{ name: 'Config', extensions: ['json'] }],
        multiple: false
      });
      if (selected && typeof selected === 'string') {
        await invoke('import_settings', { importPath: selected });
        setStatus('Settings imported. Retrying...');
        setIsConfiguring(false);
        checkConnection();
      }
    } catch (e) {
      setStatus(`Import failed: ${e}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 p-8 max-w-lg w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#00401A]">infoLib Setup</h1>
          <div className="text-xs bg-gray-400 px-2 py-1 border-inset">Step: {step.toUpperCase()}</div>
        </div>
        
        <div className="bg-white border-inset p-4 mb-4 min-h-[120px]">
          <p className="text-sm font-bold text-gray-700">{status}</p>
          {aiProgress && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 h-2 border-inset overflow-hidden">
                <div className="bg-[#00401A] h-full animate-pulse" style={{width: '100%'}}></div>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">{aiProgress}</p>
            </div>
          )}
        </div>

        {isConfiguring ? (
          <div className="space-y-4">
            {step === 'db' && isDesktopRuntime() && (
              <div>
                <label className="block text-sm font-bold mb-1">PostgreSQL URL:</label>
                <input
                  type="text"
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  className="w-full border-inset p-1 bg-white"
                />
              </div>
            )}

            {step === 'db' && !isDesktopRuntime() && (
              <div className="bg-white border-inset p-3 text-xs text-gray-700">
                Browser mode uses the shared API at <span className="font-mono">VITE_API_BASE_URL</span>. Database settings are managed on Railway.
              </div>
            )}

            <div className="flex gap-2 justify-end mt-4">
              {isDesktopRuntime() && (
                <>
                  <button
                    onClick={handleImport}
                    className="px-4 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 hover:bg-[#d4d0c8] active:border-inset"
                  >
                    Import
                  </button>
                  <button
                    onClick={handleExport}
                    className="px-4 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 hover:bg-[#d4d0c8] active:border-inset"
                  >
                    Export
                  </button>
                </>
              )}
              <button 
                onClick={step === 'db' ? (isDesktopRuntime() ? handleSaveConfig : checkConnection) : checkAiModels}
                className="px-4 py-1 bg-[#C5A059] text-[#00401A] font-bold border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 hover:brightness-110 active:border-inset"
              >
                {step === 'db' ? (isDesktopRuntime() ? 'Save & Retry' : 'Retry API') : 'Retry AI Check'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">Please wait while system components initialize...</p>
        )}

        <div className="mt-6 pt-4 border-t border-gray-400">
          <p className="text-[10px] text-gray-600">
            <strong>Failsafe:</strong> Initial setup status is persisted. If interrupted by blackout or WiFi loss, simply relaunch infoLib. Download will resume or configuration will be preserved.
          </p>
        </div>
      </div>
    </div>
  );
};
