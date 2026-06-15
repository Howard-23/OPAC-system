import React from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { FieldGroup } from '../catalog/FieldGroup';
import { useCirculationStore } from '../../stores/circulationStore';
import { usePatronStore } from '../../stores/patronStore';
import { DataGrid } from '../common/DataGrid';
import { X } from 'lucide-react';

interface CheckoutDialogProps {
  onClose: () => void;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ onClose }) => {
  const { patrons, selectedIdno } = usePatronStore();
  const { activeLoans, checkOut, fetchActiveLoans, isLoading } = useCirculationStore();
  const [accession, setAccession] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const selectedPatron = patrons.find(p => p.idno === selectedIdno);

  React.useEffect(() => {
    if (selectedIdno) {
      fetchActiveLoans(selectedIdno);
    }
  }, [selectedIdno, fetchActiveLoans]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdno || !accession) return;

    setError(null);
    try {
      await checkOut(selectedIdno, accession);
      setAccession('');
    } catch (err) {
      setError(String(err));
    }
  };

  const LOAN_COLUMNS = [
    { key: 'accession', header: 'Accession', width: '30%' },
    { key: 'dte_borrow', header: 'Borrowed', width: '35%' },
    { key: 'dte_due', header: 'Due Date', width: '35%' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <BeveledBox variant="raised" className="w-[800px] max-h-[90vh] flex flex-col bg-[#D4D0C8] shadow-2xl">
        {/* Header */}
        <div className="bg-classic-blue px-2 py-1 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/20" />
            <span className="text-white font-bold text-sm tracking-wide">Borrowing Workflow - Circulation</span>
          </div>
          <button 
            onClick={onClose}
            className="bg-[#D4D0C8] shadow-bevel-raised hover:bg-gray-100 p-0.5 active:shadow-bevel-sunken"
          >
            <X size={14} className="text-black" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-hidden">
          {/* Top Section: Patron Info & Checkout Form */}
          <div className="grid grid-cols-2 gap-4">
            <BeveledBox variant="sunken" className="p-3 bg-[#E8F0F8] flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase text-gray-600 border-b border-gray-300 pb-1">Patron Information</h3>
              {selectedPatron ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-classic-blue">{selectedPatron.name}</p>
                  <p className="text-xs text-gray-600">ID: <span className="font-mono">{selectedPatron.idno}</span></p>
                  <p className="text-xs text-gray-600">Group: {selectedPatron.group_name}</p>
                  <p className="text-xs text-gray-600">Dept: {selectedPatron.dept || 'N/A'}</p>
                </div>
              ) : (
                <p className="text-xs italic text-gray-500 py-4 text-center">No patron selected from main grid.</p>
              )}
            </BeveledBox>

            <BeveledBox variant="raised" className="p-3 bg-[#D4D0C8]">
              <h3 className="text-xs font-bold uppercase text-gray-600 border-b border-white pb-1 mb-2">Check Out Item</h3>
              <form onSubmit={handleCheckout} className="space-y-3">
                <FieldGroup label="Accession No." id="accession" className="flex-col !items-start gap-1">
                  <input 
                    id="accession"
                    value={accession}
                    onChange={(e) => setAccession(e.target.value.toUpperCase())}
                    className="input-classic w-full font-mono text-lg uppercase"
                    placeholder="SCAN OR TYPE..."
                    autoFocus
                    disabled={!selectedIdno || isLoading}
                  />
                </FieldGroup>
                {error && <p className="text-[10px] text-red-600 font-bold bg-red-50 p-1 border border-red-200">{error}</p>}
                <button 
                  type="submit"
                  disabled={!selectedIdno || !accession || isLoading}
                  className="btn-classic w-full h-10 font-bold text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Issue Item'}
                </button>
              </form>
            </BeveledBox>
          </div>

          {/* Bottom Section: Active Loans Grid */}
          <div className="flex-1 flex flex-col min-h-[300px] overflow-hidden">
            <h3 className="text-xs font-bold uppercase text-gray-600 mb-1">Active Loans for this Patron</h3>
            <div className="flex-1 overflow-hidden">
              <DataGrid 
                columns={LOAN_COLUMNS}
                data={activeLoans.map(loan => ({
                  ...loan,
                  dte_borrow: new Date(loan.dte_borrow).toLocaleDateString(),
                  dte_due: new Date(loan.dte_due).toLocaleDateString(),
                }))}
                idField="accession"
              />
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-[#D4D0C8] border-t border-white shadow-[0_-1px_0_#808080] px-2 py-0.5 text-[10px] text-gray-700 flex justify-between select-none">
          <span>{selectedPatron ? `Operating on: ${selectedPatron.idno}` : 'Waiting for selection'}</span>
          <span>Ready</span>
        </div>
      </BeveledBox>
    </div>
  );
};
