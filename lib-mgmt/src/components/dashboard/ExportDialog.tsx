import React from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { GroupBox } from '../common/GroupBox';

interface ExportDialogProps {
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ onClose }) => {
  const [option, setOption] = React.useState<'search' | 'accession'>('search');
  const [target, setTarget] = React.useState('Printer');

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[120] p-4">
      <BeveledBox variant="raised" className="w-[450px] bg-classic-grey dark:bg-dark-surface shadow-2xl flex flex-col overflow-hidden">
        {/* Title Bar */}
        <div className="bg-classic-blue-gradient px-2 py-1 flex items-center justify-between text-white font-bold text-sm">
          <span>Export Results</span>
          <button onClick={onClose} className="hover:bg-red-500 px-1">✕</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Option Selection */}
          <GroupBox label="Select Options">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer dark:text-dark-text">
                <input 
                  type="radio" 
                  name="export-option" 
                  checked={option === 'search'} 
                  onChange={() => setOption('search')}
                />
                Search Results
              </label>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer dark:text-dark-text">
                  <input 
                    type="radio" 
                    name="export-option" 
                    checked={option === 'accession'} 
                    onChange={() => setOption('accession')}
                  />
                  By Accession Number
                </label>
                <div className={`ml-6 flex items-center gap-2 transition-opacity ${option === 'accession' ? 'opacity-100' : 'opacity-40'}`}>
                  <span className="text-xs font-bold">From:</span>
                  <input disabled={option !== 'accession'} type="text" className="input-classic w-20 h-6 px-1" />
                  <span className="text-xs font-bold ml-2">To:</span>
                  <input disabled={option !== 'accession'} type="text" className="input-classic w-20 h-6 px-1" />
                </div>
              </div>
            </div>
          </GroupBox>

          {/* Destination Selection */}
          <GroupBox label="Export Results To:">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {['Printer', 'Text File', 'Delimited', 'Accession List'].map(t => (
                  <label key={t} className="flex items-center gap-2 text-sm cursor-pointer dark:text-dark-text">
                    <input 
                      type="radio" 
                      name="export-target" 
                      checked={target === t} 
                      onChange={() => setTarget(t)}
                    />
                    {t}
                  </label>
                ))}
              </div>
              <div className="pt-2">
                <input 
                  type="text" 
                  className="input-classic w-full h-7 px-2 text-sm" 
                  placeholder={target === 'Printer' ? 'System Default Printer' : 'C:\\EXPORTS\\RESULTS.TXT'}
                />
              </div>
            </div>
          </GroupBox>

          {/* Bottom Row */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer dark:text-dark-text">
              <input type="checkbox" />
              Numbered
            </label>
            <div className="flex gap-2">
              <button 
                onClick={() => { alert('Exporting...'); onClose(); }}
                className="btn-classic px-8 h-8 font-bold"
              >
                OK
              </button>
              <button 
                onClick={onClose}
                className="btn-classic px-8 h-8"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </BeveledBox>
    </div>
  );
};
