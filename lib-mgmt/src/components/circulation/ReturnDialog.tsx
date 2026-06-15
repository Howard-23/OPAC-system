import React from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { FieldGroup } from '../catalog/FieldGroup';
import { useCirculationStore } from '../../stores/circulationStore';
import { X } from 'lucide-react';

interface ReturnDialogProps {
  onClose: () => void;
}

export const ReturnDialog: React.FC<ReturnDialogProps> = ({ onClose }) => {
  const { returnItem, isLoading } = useCirculationStore();
  const [accession, setAccession] = React.useState('');
  const [fine, setFine] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accession) return;

    setError(null);
    setSuccess(null);
    setFine(null);

    try {
      const calculatedFine = await returnItem(accession);
      setFine(calculatedFine);
      setSuccess(`Item ${accession} returned successfully.`);
      setAccession('');
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <BeveledBox variant="raised" className="w-[500px] flex flex-col bg-[#D4D0C8] shadow-2xl">
        {/* Header */}
        <div className="bg-[#000080] px-2 py-1 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">Return Items</span>
          </div>
          <button 
            onClick={onClose}
            className="bg-[#D4D0C8] shadow-bevel-raised hover:bg-gray-100 p-0.5 active:shadow-bevel-sunken"
          >
            <X size={14} className="text-black" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <BeveledBox variant="raised" className="p-4 bg-[#D4D0C8]">
            <form onSubmit={handleReturn} className="space-y-4">
              <FieldGroup label="Accession No." id="return-accession" className="flex-col !items-start gap-1">
                <input 
                  id="return-accession"
                  value={accession}
                  onChange={(e) => setAccession(e.target.value.toUpperCase())}
                  className="input-classic w-full font-mono text-xl uppercase"
                  placeholder="SCAN ITEM..."
                  autoFocus
                  disabled={isLoading}
                />
              </FieldGroup>
              
              <button 
                type="submit"
                disabled={!accession || isLoading}
                className="btn-classic w-full h-12 font-bold text-base disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Process Return'}
              </button>
            </form>
          </BeveledBox>

          {/* Feedback Area */}
          <div className="h-24 flex flex-col justify-center">
            {error && (
              <div className="bg-red-50 border border-red-200 p-2 text-red-700 text-xs font-bold animate-pulse">
                ERROR: {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 p-2 text-green-700 text-xs font-bold">
                {success}
                {fine !== null && fine > 0 && (
                  <div className="mt-1 text-red-600 uppercase">
                    Overdue Fine: ${fine.toFixed(2)} added to patron's account.
                  </div>
                )}
              </div>
            )}
            {!error && !success && (
              <div className="text-gray-500 text-xs italic text-center">
                Ready to process returns.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#D4D0C8] border-t border-white shadow-[0_-1px_0_#808080] px-2 py-0.5 text-[10px] text-gray-700 flex justify-end">
          <span>infoLib Circulation Module</span>
        </div>
      </BeveledBox>
    </div>
  );
};
