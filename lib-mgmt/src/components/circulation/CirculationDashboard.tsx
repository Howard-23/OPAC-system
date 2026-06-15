import React from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { DataGrid } from '../common/DataGrid';
import { useCirculationStore } from '../../stores/circulationStore';
import { invoke } from '../../lib/runtimeBridge';
import { downloadExcelWorkbook, excelDateTime } from '../../utils/excelExport';
import { X, AlertCircle, Book, Wallet, Download } from 'lucide-react';

interface CirculationDashboardProps {
  onClose: () => void;
}

interface CirculationReportRecord {
  accession: string;
  title: string | null;
  patron_name: string | null;
  idno: string;
  dte_borrow: string;
  dte_due: string;
  dte_return: string | null;
  status: string;
}

export const CirculationDashboard: React.FC<CirculationDashboardProps> = ({ onClose }) => {
  const { overdueItems, stats, fetchOverdueItems, fetchStats, isLoading } = useCirculationStore();
  const [reportRecords, setReportRecords] = React.useState<CirculationReportRecord[]>([]);

  React.useEffect(() => {
    fetchOverdueItems();
    fetchStats();
    loadCirculationReport();
  }, [fetchOverdueItems, fetchStats]);

  const loadCirculationReport = async () => {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const records = await invoke<CirculationReportRecord[]>('get_circulation_report', { startDate, endDate });
    setReportRecords(records);
  };

  const exportCirculationReport = () => {
    downloadExcelWorkbook('circulation-report.xls', [
      {
        name: 'Borrowing History',
        columns: ['Accession', 'Title', 'Patron', 'ID No.', 'Borrowed', 'Due', 'Returned', 'Status'],
        rows: reportRecords.map((record) => [
          record.accession,
          record.title || 'Unknown',
          record.patron_name || 'Unknown',
          record.idno,
          excelDateTime(record.dte_borrow),
          excelDateTime(record.dte_due),
          excelDateTime(record.dte_return),
          record.status,
        ]),
      },
    ]);
  };

  const COLUMNS = [
    { key: 'accession', header: 'Accession', width: '15%' },
    { key: 'title', header: 'Title', width: '35%' },
    { key: 'patron_name', header: 'Patron', width: '25%' },
    { key: 'due_date', header: 'Due Date', width: '15%' },
    { key: 'days_overdue', header: 'Days', width: '10%' },
  ];

  const REPORT_COLUMNS = [
    { key: 'accession', header: 'Accession', width: '14%' },
    { key: 'title', header: 'Title', width: '30%' },
    { key: 'patron_name', header: 'Patron', width: '22%' },
    { key: 'dte_borrow', header: 'Borrowed', width: '14%' },
    { key: 'dte_due', header: 'Due', width: '14%' },
    { key: 'status', header: 'Status', width: '6%' },
  ];

  const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => (
    <BeveledBox variant="sunken" className="p-3 bg-white dark:bg-dark-input dark:text-dark-text flex items-center gap-4 flex-1">
      <div className={`p-2 rounded-sm ${color} bg-opacity-20`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-gray-500 leading-none mb-1">{label}</p>
        <p className="text-xl font-bold tracking-tight">{value}</p>
      </div>
    </BeveledBox>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <BeveledBox variant="raised" className="w-[1000px] h-[700px] flex flex-col bg-[#D4D0C8] dark:bg-dark-surface shadow-2xl">
        {/* Header */}
        <div className="bg-[#000080] px-2 py-1 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm tracking-wide">Circulation Management Dashboard</span>
          </div>
          <button 
            onClick={onClose}
            className="bg-[#D4D0C8] shadow-bevel-raised hover:bg-gray-100 p-0.5 active:shadow-bevel-sunken"
          >
            <X size={14} className="text-black" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 flex-1 overflow-hidden">
          <div className="flex gap-4">
            <StatCard 
              icon={Book} 
              label="Active Loans" 
              value={stats?.total_active || 0} 
              color="bg-blue-600" 
            />
            <StatCard 
              icon={AlertCircle} 
              label="Overdue Items" 
              value={stats?.total_overdue || 0} 
              color="bg-red-600" 
            />
            <StatCard 
              icon={Wallet} 
              label="Total Fines" 
              value={`$${stats?.total_fines || 0}`} 
              color="bg-green-600" 
            />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase text-gray-600 dark:text-dark-text">Overdue Items (Action Required)</h3>
              <button 
                onClick={() => fetchOverdueItems()} 
                className="text-[10px] font-bold text-blue-800 hover:underline"
              >
                Refresh List
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <DataGrid 
                columns={COLUMNS} 
                data={overdueItems.map(item => ({
                  ...item,
                  due_date: new Date(item.due_date).toLocaleDateString(),
                  days_overdue: <span className="text-red-600 font-bold">{item.days_overdue}</span>
                }))}
                idField="accession"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase text-gray-600 dark:text-dark-text">Recent Borrowing History</h3>
              <button
                onClick={exportCirculationReport}
                className="btn-classic px-3 h-7 flex items-center gap-2 text-[10px] font-bold"
              >
                <Download size={12} /> Excel
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <DataGrid
                columns={REPORT_COLUMNS}
                data={reportRecords.map((record) => ({
                  ...record,
                  title: record.title || 'Unknown',
                  patron_name: record.patron_name || 'Unknown',
                  dte_borrow: new Date(record.dte_borrow).toLocaleDateString(),
                  dte_due: new Date(record.dte_due).toLocaleDateString(),
                }))}
                idField="accession"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#D4D0C8] dark:bg-dark-panel border-t border-white dark:border-dark-highlight shadow-[0_-1px_0_#808080] dark:shadow-[0_-1px_0_#1A1A1A] px-2 py-0.5 text-[10px] text-gray-700 dark:text-dark-text flex justify-between select-none">
          <span>{isLoading ? 'Fetching data...' : 'All systems operational'}</span>
          <span>Records: {overdueItems.length}</span>
        </div>
      </BeveledBox>
    </div>
  );
};
