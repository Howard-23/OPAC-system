import React, { useState, useEffect } from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { GroupBox } from '../common/GroupBox';
import { TitleBar } from '../layout/TitleBar';
import { invoke } from '../../lib/runtimeBridge';
import { Wallet, TrendingUp, Download, Printer } from 'lucide-react';
import { downloadExcelWorkbook, excelDateTime } from '../../utils/excelExport';

interface PaymentRecord {
  amount_pay: number;
  idno: string;
  dte_pay: string;
  cashier: string;
  patron_name: string | null;
}

interface FinancialSummary {
  total_collected: number;
  total_outstanding: number;
  recent_payments: PaymentRecord[];
}

interface FinancialReportsDialogProps {
  onClose: () => void;
}

export const FinancialReportsDialog: React.FC<FinancialReportsDialogProps> = ({ onClose }) => {
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const result = await invoke<FinancialSummary>('get_financial_reports');
      setData(result);
    } catch (err) {
      console.error('Failed to load financial reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!data) {
      return;
    }

    downloadExcelWorkbook('financial-reports.xls', [
      {
        name: 'Financial Summary',
        columns: ['Metric', 'Amount'],
        rows: [
          ['Total Fines Collected', data.total_collected],
          ['Total Outstanding Fines', data.total_outstanding],
        ],
      },
      {
        name: 'Recent Payment History',
        columns: ['Date/Time', 'ID No.', 'Patron Name', 'Amount', 'Cashier'],
        rows: data.recent_payments.map((payment) => [
          excelDateTime(payment.dte_pay),
          payment.idno,
          payment.patron_name || 'Unknown',
          payment.amount_pay,
          payment.cashier,
        ]),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
      <BeveledBox variant="raised" className="w-full max-w-4xl h-[80vh] flex flex-col bg-[#D4D0C8] dark:bg-dark-surface">
        <TitleBar title="Financial Reports & Fine Collection" onClose={onClose} />

        <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center italic text-gray-600 dark:text-dark-text-muted">
              Generating reports...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GroupBox label="Collection Summary">
                  <div className="flex items-center gap-4 p-2">
                    <div className="p-3 bg-green-100 dark:bg-dark-input border border-green-600 dark:border-dark-border-dark text-green-700 dark:text-green-400">
                      <Wallet size={32} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase text-gray-600 dark:text-dark-text-muted">Total Fines Collected</div>
                      <div className="text-3xl font-bold text-green-800 font-mono">
                        PHP {data?.total_collected.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </GroupBox>

                <GroupBox label="Liability Summary">
                  <div className="flex items-center gap-4 p-2">
                    <div className="p-3 bg-red-100 dark:bg-dark-input border border-red-600 dark:border-dark-border-dark text-red-700 dark:text-red-400">
                      <TrendingUp size={32} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase text-gray-600 dark:text-dark-text-muted">Total Outstanding Fines</div>
                      <div className="text-3xl font-bold text-red-800 font-mono">
                        PHP {data?.total_outstanding.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </GroupBox>
              </div>

              <GroupBox label="Recent Payment History" className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-dark-input border-2 border-inset border-gray-400 dark:border-dark-border-dark">
                  <div className="bg-[#808080] dark:bg-dark-surface text-white dark:text-dark-text flex font-bold text-xs p-1 sticky top-0 z-10">
                    <div className="w-32 px-1">Date/Time</div>
                    <div className="w-24 px-1">ID No.</div>
                    <div className="flex-1 px-1">Patron Name</div>
                    <div className="w-24 px-1 text-right">Amount</div>
                    <div className="w-24 px-1 text-right">Cashier</div>
                  </div>

                  <div className="flex-1 overflow-y-scroll">
                    {data?.recent_payments.map((payment, idx) => (
                      <div key={idx} className="flex text-xs p-1 border-b border-gray-100 dark:border-dark-border-dark hover:bg-blue-50 dark:hover:bg-dark-selection/30 dark:text-dark-text">
                        <div className="w-32 px-1 text-gray-600 dark:text-dark-text-muted">
                          {new Date(payment.dte_pay).toLocaleString()}
                        </div>
                        <div className="w-24 px-1 font-mono">{payment.idno}</div>
                        <div className="flex-1 px-1 font-bold">{payment.patron_name || 'Unknown'}</div>
                        <div className="w-24 px-1 text-right font-bold text-green-700">
                          PHP {payment.amount_pay.toLocaleString()}
                        </div>
                        <div className="w-24 px-1 text-right text-gray-500 dark:text-dark-text-muted uppercase">{payment.cashier}</div>
                      </div>
                    ))}
                    {data?.recent_payments.length === 0 && (
                      <div className="p-8 text-center text-gray-400 dark:text-dark-text-muted italic">No payment records found.</div>
                    )}
                  </div>
                </div>
              </GroupBox>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="btn-classic px-4 h-8 flex items-center gap-2">
                    <Printer size={14} /> Print Report
                  </button>
                  <button onClick={exportReport} className="btn-classic px-4 h-8 flex items-center gap-2">
                    <Download size={14} /> Download Excel
                  </button>
                </div>
                <button onClick={onClose} className="btn-classic px-8 h-10 font-bold">
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </BeveledBox>
    </div>
  );
};
