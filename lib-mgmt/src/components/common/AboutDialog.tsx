import React from 'react';
import { BeveledBox } from '../common/BeveledBox';

interface AboutDialogProps {
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100] p-4">
      <BeveledBox variant="raised" className="w-80 bg-classic-grey shadow-2xl flex flex-col p-6 items-center text-center space-y-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tighter text-classic-blue italic">
            infoLib.
          </h1>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            Library Information System
          </p>
        </div>

        <div className="space-y-1 text-sm text-gray-700">
          <p className="font-bold">Version 1.0.4 (Build 2026)</p>
          <p>© 2026 infoLib Solutions Inc.</p>
        </div>

        <div className="w-full h-[1px] bg-gray-400 shadow-[0_1px_0_white]" />

        <p className="text-[11px] text-gray-500 italic">
          High-parity legacy modernization project.
        </p>

        <button 
          onClick={onClose}
          className="btn-classic px-8 h-8 font-bold mt-2"
        >
          OK
        </button>
      </BeveledBox>
    </div>
  );
};
