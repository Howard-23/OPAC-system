import React from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { useSyncStore } from '../../stores/syncStore';

interface SyncComboButtonProps {
  onShowLogs: () => void;
}

export const SyncComboButton: React.FC<SyncComboButtonProps> = ({ onShowLogs }) => {
  const { isSyncing, syncNow } = useSyncStore();

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center group">
        <div className="flex">
          <button
            onClick={syncNow}
            disabled={isSyncing}
            className={`
              flex flex-col items-center justify-center w-16 h-20 gap-1
              btn-classic
              ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-dark-surface-alt'}
            `}
            title="Verify shared backend"
          >
            <div className={`p-1 ${isSyncing ? 'animate-spin' : 'group-active:translate-y-0.5'} transition-transform`}>
              <RefreshCw size={24} strokeWidth={1.5} className="text-[#404040] dark:text-dark-text" />
            </div>
            <span className="text-[10px] font-medium text-black dark:text-dark-text">
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </span>
          </button>
          
          <button
            onClick={onShowLogs}
            className="flex items-center justify-center w-6 h-20 btn-classic hover:bg-gray-200 dark:hover:bg-dark-surface-alt border-l-0"
            title="View Sync Logs Dialog"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
