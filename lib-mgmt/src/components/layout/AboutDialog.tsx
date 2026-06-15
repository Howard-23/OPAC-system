import React from 'react';
import { convertFileSrc, invoke } from '../../lib/runtimeBridge';

interface AboutDialogProps {
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ onClose }) => {
  const [logoPath, setLogoPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadLogo = async () => {
      try {
        const path = await invoke<string | null>('get_logo_path');
        setLogoPath(path);
      } catch (e) {
        console.error(e);
      }
    };
    loadLogo();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center backdrop-blur-sm transition-all duration-300">
      <div className="bg-[#D4D0C8] dark:bg-dark-surface border-t-2 border-l-2 border-white dark:border-dark-highlight border-b-2 border-r-2 border-gray-800 dark:border-dark-shadow w-[420px] shadow-2xl animate-fade-in">
        {/* Title Bar */}
        <div className="title-bar-gjc">
          <div className="flex items-center gap-2">
            <span className="text-lg">ℹ</span>
            <span>About infoLib Library Management System</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-gray-800 text-[10px] font-bold leading-none hover:bg-red-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-24 h-24 bg-[#A6CAF0] dark:bg-dark-title rounded-full flex items-center justify-center shadow-lg border-4 border-white/50 dark:border-dark-highlight/50 overflow-hidden">
              {logoPath ? (
                <img 
                  src={convertFileSrc(logoPath)} 
                  alt="Logo" 
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <span className="text-white text-4xl font-bold italic">LIB</span>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#000080] dark:text-dark-accent italic">infoLib Library System</h2>
            <p className="text-[10px] text-gray-500 dark:text-dark-text-muted font-bold uppercase tracking-widest">Premium School Edition</p>
          </div>

          <div className="bg-white/50 dark:bg-dark-input/50 p-4 border-2 border-gray-600 dark:border-dark-border-dark border-t-gray-800 dark:border-t-dark-shadow border-l-gray-800 dark:border-l-dark-shadow shadow-inner space-y-2">
            <p className="text-sm font-bold text-gray-800 dark:text-dark-text">Version 1.0.0 (Production)</p>
            <p className="text-xs text-gray-600 dark:text-dark-text-muted leading-relaxed">
              Developed for <strong>General de Jesus College</strong> Library.<br />
              All rights reserved &copy; 2026.
            </p>
          </div>

          <div className="text-[10px] text-gray-500 dark:text-dark-text-muted font-mono">
            Tauri v2.0-rc | React 18 | PostgreSQL 18
          </div>

          <button
            onClick={onClose}
            className="btn-gjc px-8 py-2 text-sm"
          >
            Close
          </button>
        </div>

        <div className="bg-gray-300 dark:bg-dark-border-light h-1 w-full" />
      </div>
    </div>
  );
};
