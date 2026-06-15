import React from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { FieldGroup } from '../catalog/FieldGroup';
import { usePatronStore } from '../../stores/patronStore';
import { X, Wallet } from 'lucide-react';

interface PaymentDialogProps {
  onClose: () => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({ onClose }) => {
  const { patrons, selectedIdno, payFine } = usePatronStore();
  const [amount, setAmount] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const selectedPatron = patrons.find(p => p.idno === selectedIdno);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdno || !amount) return;

    setIsProcessing(true);
    try {
      await payFine(selectedIdno, parseInt(amount));
      onClose();
    } catch (err) {
      alert('Payment failed: ' + err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedPatron) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <BeveledBox variant="raised" className="w-[400px] bg-[#D4D0C8] dark:bg-dark-surface shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#000080] px-2 py-1 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <Wallet size={14} className="text-white" />
            <span className="text-white font-bold text-sm">Fine Payment - {selectedPatron.name}</span>
          </div>
          <button 
            onClick={onClose}
            className="bg-[#D4D0C8] shadow-bevel-raised hover:bg-gray-100 p-0.5 active:shadow-bevel-sunken"
          >
            <X size={14} className="text-black" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <BeveledBox variant="sunken" className="p-4 bg-white dark:bg-dark-input text-center">
            <p className="text-[10px] font-bold uppercase text-gray-500 dark:text-dark-text-muted mb-1">Current Unpaid Balance</p>
            <p className="text-3xl font-black text-red-600 tracking-tighter">
              ${selectedPatron.unpaid_fine.toFixed(2)}
            </p>
          </BeveledBox>

          <form onSubmit={handlePayment} className="space-y-4">
            <FieldGroup label="Payment Amount ($)" id="pay-amount" className="flex-col !items-start gap-1">
              <input 
                id="pay-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-classic w-full text-xl font-bold"
                placeholder="0.00"
                min="1"
                max={selectedPatron.unpaid_fine}
                autoFocus
                required
              />
            </FieldGroup>

            <div className="flex gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setAmount(selectedPatron.unpaid_fine.toString())}
                className="btn-classic flex-1 py-2 text-xs"
              >
                Pay Full Amount
              </button>
              <button 
                type="submit"
                disabled={isProcessing || !amount}
                className="btn-classic flex-1 py-2 font-bold bg-green-50 disabled:opacity-50"
              >
                {isProcessing ? 'Saving...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-[#D4D0C8] dark:bg-dark-panel border-t border-white dark:border-dark-highlight px-2 py-0.5 text-[10px] text-gray-600 dark:text-dark-text italic">
          Transaction will be logged to patron's account.
        </div>
      </BeveledBox>
    </div>
  );
};
