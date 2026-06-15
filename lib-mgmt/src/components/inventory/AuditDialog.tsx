import React, { useState, useEffect, useRef } from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { TitleBar } from '../layout/TitleBar';
import { useAuditStore } from '../../stores/auditStore';
import { ScanBarcode, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AuditDialogProps {
  onClose: () => void;
}

export const AuditDialog: React.FC<AuditDialogProps> = ({ onClose }) => {
  const { scannedItems, isScanning, error, startScanning, stopScanning, scanItem, clearSession } = useAuditStore();
  const [barcode, setBarcode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isScanning) {
      inputRef.current?.focus();
    }
  }, [isScanning]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      await scanItem(barcode.trim());
      setBarcode('');
      inputRef.current?.focus();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'text-green-700';
      case 'checked out': return 'text-orange-700';
      case 'missing': return 'text-red-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
      <BeveledBox variant="raised" className="w-full max-w-4xl h-[80vh] flex flex-col bg-[#D4D0C8] dark:bg-dark-surface">
        <TitleBar title="Inventory Audit (Shelf-Read)" onClose={onClose} />
        
        <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Controls */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1 dark:text-dark-text">Scan Accession Barcode:</label>
              <form onSubmit={handleScan} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  disabled={!isScanning}
                  className="flex-1 h-8 px-2 border-2 border-inset dark:border-dark-border-dark bg-white dark:bg-dark-input dark:text-dark-text focus:outline-none font-mono"
                  placeholder={isScanning ? "Ready to scan..." : "Click Start to begin..."}
                />
                <button 
                  type="submit"
                  disabled={!isScanning}
                  className="btn-classic px-4 h-8"
                >
                  Enter
                </button>
              </form>
            </div>
            
            <div className="flex gap-2">
              {!isScanning ? (
                <button onClick={startScanning} className="btn-classic px-6 h-10 font-bold bg-[#000080] text-white">
                  START SESSION
                </button>
              ) : (
                <button onClick={stopScanning} className="btn-classic px-6 h-10 font-bold bg-[#800000] text-white">
                  STOP SESSION
                </button>
              )}
              <button onClick={clearSession} className="btn-classic px-4 h-10">
                Clear List
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1 text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Session List */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="bg-[#808080] dark:bg-dark-surface text-white dark:text-dark-text flex font-bold text-xs p-1 sticky top-0 z-10 border-b border-gray-300 dark:border-dark-border-dark">
              <div className="w-24 px-1">Accession</div>
              <div className="flex-1 px-1">Title</div>
              <div className="w-32 px-1">Location</div>
              <div className="w-32 px-1">DB Status</div>
              <div className="w-32 px-1 text-right">Audit Time</div>
            </div>
            
            <div className="flex-1 overflow-y-scroll bg-white dark:bg-dark-input border-2 border-inset border-gray-400 dark:border-dark-border-dark">
              {scannedItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-dark-text-muted italic">
                  <ScanBarcode size={48} strokeWidth={1} />
                  <p>No items scanned in this session</p>
                </div>
              ) : (
                scannedItems.map((item, idx) => (
                  <div 
                    key={`${item.accession}-${idx}`} 
                    className={`flex text-xs p-1 border-b border-gray-100 dark:border-dark-border-dark items-center dark:text-dark-text ${idx === 0 ? 'bg-blue-50 dark:bg-dark-selection/30' : 'hover:bg-blue-50 dark:hover:bg-dark-selection/30'}`}
                  >
                    <div className="w-24 px-1 font-mono font-bold">{item.accession}</div>
                    <div className="flex-1 px-1 truncate font-bold">{item.title}</div>
                    <div className="w-32 px-1 truncate">{item.location}</div>
                    <div className={`w-32 px-1 font-bold ${getStatusColor(item.status)} flex items-center gap-1`}>
                      {item.status === 'Available' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {item.status}
                    </div>
                    <div className="w-32 px-1 text-right text-gray-500 dark:text-dark-text-muted">
                      {item.last_audit ? new Date(item.last_audit).toLocaleTimeString() : 'N/A'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="flex justify-between items-center text-sm font-bold bg-[#D4D0C8] dark:bg-dark-panel dark:text-dark-text p-2 border-t-2 border-white dark:border-dark-highlight shadow-[-1px_-1px_0_#808080] dark:shadow-[-1px_-1px_0_#1A1A1A]">
            <div>Total Scanned: {scannedItems.length}</div>
            <div>Session Status: {isScanning ? <span className="text-green-700 uppercase animate-pulse">Scanning Active</span> : <span className="text-red-700 uppercase">Stopped</span>}</div>
            <button onClick={onClose} className="btn-classic px-6 h-8">Close Window</button>
          </div>
        </div>
      </BeveledBox>
    </div>
  );
};
