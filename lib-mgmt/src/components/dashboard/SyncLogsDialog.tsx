import React from 'react';
import { ClipboardList, CheckCircle, XCircle, Info, Trash2, RefreshCw } from 'lucide-react';
import { useSyncStore } from '../../stores/syncStore';
import { BeveledBox } from '../common/BeveledBox';

interface SyncLogsDialogProps {
  onClose: () => void;
}

export const SyncLogsDialog: React.FC<SyncLogsDialogProps> = ({ onClose }) => {
  const { logs, clearLogs, isSyncing, syncNow, lastSync } = useSyncStore();

  return (
    <div className="fixed inset-0 bg-black/40 z-[110] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-[#D4D0C8] dark:bg-dark-surface border-t-2 border-l-2 border-white dark:border-dark-highlight border-b-2 border-r-2 border-gray-800 dark:border-dark-shadow w-full max-w-2xl shadow-2xl animate-fade-in flex flex-col max-h-[80vh]">
        {/* Title Bar */}
        <div className="title-bar-gjc">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} />
            <span>Shared Backend Logs</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-gray-800 text-[10px] font-bold leading-none hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Toolbar in Dialog */}
        <div className="p-2 bg-[#D4D0C8] dark:bg-dark-surface border-b border-gray-400 dark:border-dark-border-dark flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="btn-classic px-3 py-1 flex items-center gap-2 text-xs"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={clearLogs}
              className="btn-classic px-3 py-1 flex items-center gap-2 text-xs"
            >
              <Trash2 size={14} />
              Clear Logs
            </button>
          </div>
          {lastSync && (
            <span className="text-[10px] font-bold text-[#000080] dark:text-dark-accent">
              LAST SUCCESSFUL SYNC: {new Date(lastSync).toLocaleString()}
            </span>
          )}
        </div>

        {/* Logs Container */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <BeveledBox variant="sunken" className="flex-1 bg-white dark:bg-dark-input overflow-y-auto p-2 font-mono">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 italic text-sm">
                No synchronization events recorded.
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex gap-3 p-2 border-b border-gray-100 dark:border-dark-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-dark-surface-alt transition-colors"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {log.type === 'success' && <CheckCircle size={14} className="text-green-600" />}
                      {log.type === 'error' && <XCircle size={14} className="text-red-600" />}
                      {log.type === 'info' && <Info size={14} className="text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-[11px] leading-snug dark:text-dark-text font-bold">
                          {log.message}
                        </p>
                        <span className="text-[9px] text-gray-400 font-mono whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[9px] text-gray-500 dark:text-dark-text-muted mt-0.5">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BeveledBox>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#D4D0C8] dark:bg-dark-surface border-t border-white dark:border-dark-highlight flex justify-end">
          <button
            onClick={onClose}
            className="btn-classic px-8 py-1.5 text-sm font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
