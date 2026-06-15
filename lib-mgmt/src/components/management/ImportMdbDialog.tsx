import React, { useState } from 'react';
import { X, DatabaseBackup, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { BeveledBox } from '../common/BeveledBox';
import { ImportSummaryView, ImportSummaryData } from './ImportSummaryView';
import { invoke, isDesktopRuntime } from '../../lib/runtimeBridge';
import { useCatalogStore } from '../../stores/catalogStore';

interface ImportMdbDialogProps {
  onClose: () => void;
}

type Step = 'select' | 'validating' | 'importing' | 'summary' | 'error';

export const ImportMdbDialog: React.FC<ImportMdbDialogProps> = ({ onClose }) => {
  const [step, setStep] = useState<Step>('select');
  const [mdbPath, setMdbPath] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummaryData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOdbcMissing, setIsOdbcMissing] = useState(false);
  
  const { fetchRecords } = useCatalogStore();

  const handleBrowse = async () => {
    try {
      if (!isDesktopRuntime()) {
        throw new Error('Legacy MDB import is only available in the desktop app.');
      }

      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Access Database', extensions: ['mdb'] }]
      });
      if (selected && typeof selected === 'string') {
        setMdbPath(selected);
      }
    } catch (err) {
      console.error("Failed to open file dialog", err);
    }
  };

  const handleImport = async () => {
    if (!mdbPath) return;
    setStep('importing');
    setErrorMsg(null);
    setIsOdbcMissing(false);

    try {
      const res = await invoke<ImportSummaryData>('import_mdb_database', { mdbPath, dryRun: false });
      setSummary(res);
      setStep('summary');
      await fetchRecords(); // Refresh dashboard
    } catch (err: any) {
      if (err === 'odbc_missing') {
        setIsOdbcMissing(true);
      } else {
        setErrorMsg(err.toString());
      }
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <BeveledBox variant="raised" className="w-full max-w-lg flex flex-col bg-[#D4D0C8] dark:bg-dark-surface shadow-2xl">
        {/* Title Bar */}
        <div className="h-7 bg-gradient-to-r from-classic-blue to-[#1084d0] dark:from-dark-accent dark:to-dark-highlight flex items-center justify-between px-2 cursor-default">
          <div className="flex items-center gap-2">
            <DatabaseBackup className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm tracking-wide">Import Legacy Access Database</span>
          </div>
          <button 
            onClick={step !== 'validating' && step !== 'importing' ? onClose : undefined}
            disabled={step === 'validating' || step === 'importing'}
            className="w-5 h-5 flex items-center justify-center bg-[#D4D0C8] dark:bg-dark-surface hover:bg-classic-grey dark:hover:bg-dark-highlight active:bg-gray-400 disabled:opacity-50 border-t border-l border-white dark:border-dark-highlight border-b border-r border-b-gray-800 border-r-gray-800"
          >
            <X className="w-4 h-4 text-black dark:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1">
          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-sm dark:text-gray-300">
                Select a legacy Microsoft Access database (<b>glDB.mdb</b>) to import. The system will automatically create a backup of your current database before proceeding.
              </p>
              
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={mdbPath || ''} 
                  readOnly 
                  placeholder="No file selected..."
                  className="input-classic flex-1"
                />
                <button 
                  onClick={handleBrowse}
                  className="px-4 py-1 bg-[#D4D0C8] dark:bg-dark-surface border-t border-l border-white dark:border-dark-highlight border-b border-r border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm"
                >
                  Browse...
                </button>
              </div>

              <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 p-2 flex gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800 dark:text-yellow-400">
                  A full database backup will be created automatically before import. Duplicate records will be skipped.
                </p>
              </div>
            </div>
          )}

          {step === 'validating' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-classic-blue dark:text-dark-accent" />
              <p className="text-sm font-bold dark:text-white">Validating Records...</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Checking ODBC driver and analyzing MDB file.</p>
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-classic-blue dark:text-dark-accent" />
              <p className="text-sm font-bold dark:text-white">Importing Database...</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Creating backup and writing records. Do not close.</p>
            </div>
          )}

          {step === 'summary' && summary && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold">Import Completed Successfully</span>
              </div>
              <ImportSummaryView summary={summary} />
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold">Import Failed</span>
              </div>
              
              {isOdbcMissing ? (
                <div className="text-sm space-y-2 dark:text-gray-300">
                  <p>The Microsoft Access Database Engine (ODBC driver) was not found on this system.</p>
                  <p>Please download and install the <b>Microsoft Access Database Engine 2016 Redistributable</b> to enable legacy database imports.</p>
                  <a 
                    href="https://www.microsoft.com/en-us/download/details.aspx?id=54920" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-600 hover:underline block mt-2"
                  >
                    Download Driver (microsoft.com)
                  </a>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2 text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap max-h-40 overflow-auto font-mono">
                  {errorMsg}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 flex justify-end gap-2 border-t border-gray-400 dark:border-dark-border">
          {step === 'select' && (
            <>
              <button 
                onClick={onClose}
                className="px-6 py-1 bg-[#D4D0C8] dark:bg-dark-surface border-t border-l border-white dark:border-dark-highlight border-b border-r border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleImport} // Skipping validation step UI for simplicity, doing direct import
                disabled={!mdbPath}
                className="px-6 py-1 bg-[#D4D0C8] dark:bg-dark-surface border-t border-l border-white dark:border-dark-highlight border-b border-r border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm disabled:opacity-50"
              >
                Start Import
              </button>
            </>
          )}

          {(step === 'summary' || step === 'error') && (
            <button 
              onClick={onClose}
              className="px-6 py-1 bg-[#D4D0C8] dark:bg-dark-surface border-t border-l border-white dark:border-dark-highlight border-b border-r border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm"
            >
              Close
            </button>
          )}
        </div>
      </BeveledBox>
    </div>
  );
};
