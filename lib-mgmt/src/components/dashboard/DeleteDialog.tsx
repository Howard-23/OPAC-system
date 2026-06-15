import React from 'react';
import { BeveledBox } from '../common/BeveledBox';

interface DeleteDialogProps {
  controlNo: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({ controlNo, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[110] p-4">
      <BeveledBox variant="raised" className="w-[350px] bg-classic-grey dark:bg-dark-surface shadow-2xl flex flex-col overflow-hidden">
        {/* Title Bar */}
        <div className="bg-classic-blue-gradient px-2 py-1 flex items-center justify-between text-white font-bold text-sm">
          <span>Delete</span>
          <button onClick={onCancel} className="hover:bg-red-500 px-1">✕</button>
        </div>

        <div className="p-6 space-y-6 flex flex-col items-center">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium dark:text-dark-text">Delete the Record?</p>
            <p className="text-sm font-bold text-blue-800 dark:text-dark-accent">'{controlNo}'</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onConfirm}
              className="btn-classic px-8 h-8 font-bold min-w-[80px]"
            >
              Yes
            </button>
            <button 
              onClick={onCancel}
              className="btn-classic px-8 h-8 min-w-[80px]"
            >
              No
            </button>
          </div>
        </div>
      </BeveledBox>
    </div>
  );
};
