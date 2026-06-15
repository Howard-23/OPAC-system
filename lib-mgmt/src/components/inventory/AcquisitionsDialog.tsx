import React, { useState, useEffect } from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { GroupBox } from '../common/GroupBox';
import { TitleBar } from '../layout/TitleBar';
import { invoke } from '../../lib/runtimeBridge';
import { BookPlus, Search, Download, Printer, Calendar } from 'lucide-react';
import { downloadExcelWorkbook, excelDateTime } from '../../utils/excelExport';

interface AcquisitionRecord {
  controlno: string;
  accession: string | null;
  title: string;
  author: string;
  date_acquired: string;
}

interface AcquisitionsDialogProps {
  onClose: () => void;
}

export const AcquisitionsDialog: React.FC<AcquisitionsDialogProps> = ({ onClose }) => {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AcquisitionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const start = new Date(startDate).toISOString();
      const end = new Date(endDate + 'T23:59:59Z').toISOString();
      const result = await invoke<AcquisitionRecord[]>('get_acquisitions_report', { 
        startDate: start, 
        endDate: end 
      });
      setRecords(result);
    } catch (err) {
      console.error('Failed to load acquisitions report:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    downloadExcelWorkbook('acquisitions-report.xls', [
      {
        name: 'Acquisitions History',
        columns: ['Control No.', 'Accession', 'Title', 'Author', 'Date Acquired'],
        rows: records.map((item) => [
          item.controlno,
          item.accession || 'Catalog record only',
          item.title,
          item.author || 'N/A',
          excelDateTime(item.date_acquired),
        ]),
      },
    ]);
  };

  useEffect(() => {
    loadReport();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
      <BeveledBox variant="raised" className="w-full max-w-5xl h-[85vh] flex flex-col bg-[#D4D0C8] dark:bg-dark-surface">
        <TitleBar title="Acquisitions Report (New Accessions)" onClose={onClose} />
        
        <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Filters */}
          <GroupBox label="Report Parameters">
            <div className="flex gap-4 items-end p-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-gray-600 dark:text-dark-text flex items-center gap-1">
                  <Calendar size={12} /> Start Date
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 px-2 border-2 border-inset dark:border-dark-border-dark bg-white dark:bg-dark-input dark:text-dark-text focus:outline-none text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-gray-600 dark:text-dark-text flex items-center gap-1">
                  <Calendar size={12} /> End Date
                </label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 px-2 border-2 border-inset dark:border-dark-border-dark bg-white dark:bg-dark-input dark:text-dark-text focus:outline-none text-sm"
                />
              </div>
              <button 
                onClick={loadReport}
                disabled={loading}
                className="btn-classic px-6 h-8 flex items-center gap-2 font-bold"
              >
                <Search size={14} /> {loading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </GroupBox>

          {/* Report Table */}
          <GroupBox label="Acquisitions History" className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-dark-input border-2 border-inset border-gray-400 dark:border-dark-border-dark">
              <div className="bg-[#808080] dark:bg-dark-surface text-white dark:text-dark-text flex font-bold text-xs p-1 sticky top-0 z-10 border-b border-gray-300 dark:border-dark-border-dark">
                <div className="w-24 px-1">Accession</div>
                <div className="flex-1 px-1">Title</div>
                <div className="w-48 px-1">Author</div>
                <div className="w-32 px-1 text-right">Date Acquired</div>
              </div>
              
              <div className="flex-1 overflow-y-scroll">
                {records.map((item, idx) => (
                  <div key={idx} className="flex text-xs p-1 border-b border-gray-100 dark:border-dark-border-dark hover:bg-blue-50 dark:hover:bg-dark-selection/30 dark:text-dark-text items-center">
                    <div className="w-24 px-1 font-mono font-bold">{item.accession || item.controlno}</div>
                    <div className="flex-1 px-1 font-bold">{item.title}</div>
                    <div className="w-48 px-1 truncate">{item.author || 'N/A'}</div>
                    <div className="w-32 px-1 text-right text-gray-600 dark:text-dark-text-muted">
                      {new Date(item.date_acquired).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {records.length === 0 && !loading && (
                  <div className="p-12 flex flex-col items-center justify-center text-gray-400 dark:text-dark-text-muted italic gap-2">
                    <BookPlus size={48} strokeWidth={1} />
                    <p>No acquisitions found for this period.</p>
                  </div>
                )}
              </div>
            </div>
          </GroupBox>

          {/* Summary & Actions */}
          <div className="flex justify-between items-center text-sm font-bold bg-[#D4D0C8] dark:bg-dark-panel dark:text-dark-text p-2 border-t-2 border-white dark:border-dark-highlight shadow-[-1px_-1px_0_#808080] dark:shadow-[-1px_-1px_0_#1A1A1A]">
            <div>Items Found: {records.length}</div>
            <div className="flex gap-2">
              <button className="btn-classic px-4 h-8 flex items-center gap-2">
                <Printer size={14} /> Print
              </button>
              <button onClick={exportReport} className="btn-classic px-4 h-8 flex items-center gap-2">
                <Download size={14} /> Excel
              </button>
              <button onClick={onClose} className="btn-classic px-6 h-8 ml-4">
                Close
              </button>
            </div>
          </div>
        </div>
      </BeveledBox>
    </div>
  );
};
