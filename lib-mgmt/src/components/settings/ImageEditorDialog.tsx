import React, { useState } from 'react';
import { convertFileSrc, invoke } from '../../lib/runtimeBridge';

interface ImageEditorDialogProps {
  sourcePath: string;
  onClose: () => void;
  onSaved: () => void;
}

export const ImageEditorDialog: React.FC<ImageEditorDialogProps> = ({ sourcePath, onClose, onSaved }) => {
  const [rotate, setRotate] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [autoCrop, setAutoCrop] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleRotate = () => {
    setRotate((prev) => (prev + 90) % 360);
  };

  const handleSave = async () => {
    setIsProcessing(true);
    setError('');
    try {
      await invoke('process_logo', {
        sourcePath,
        options: {
          rotate,
          flip_h: flipH,
          flip_v: flipV,
          auto_crop: autoCrop
        }
      });
      onSaved();
    } catch (e) {
      setError(String(e));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-md animate-fade-in">
      <div className="bg-[#D4D0C8] dark:bg-dark-surface border-t-2 border-l-2 border-white dark:border-dark-highlight border-b-2 border-r-2 border-gray-800 dark:border-dark-shadow w-[500px] shadow-2xl overflow-hidden flex flex-col">
        {/* Title Bar */}
        <div className="title-bar-gjc">
          <div className="flex items-center gap-2">
             <span>🖼️ Logo Editor</span>
          </div>
          <button onClick={onClose} className="w-5 h-5 bg-[#c0c0c0] border border-gray-800 text-[10px] font-bold hover:bg-red-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-6">
          {/* Preview Area */}
          <div className="aspect-square w-full max-w-[280px] mx-auto bg-white dark:bg-dark-input border-2 border-gray-600 dark:border-dark-border-dark border-t-gray-800 dark:border-t-dark-shadow border-l-gray-800 dark:border-l-dark-shadow shadow-inner overflow-hidden flex items-center justify-center relative">
            <img 
              src={convertFileSrc(sourcePath)} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain transition-transform duration-300"
              style={{
                transform: `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                clipPath: autoCrop ? 'inset(0 0 0 0)' : 'none' // Simplified, crop visual is harder without heavy libs
              }}
            />
            {autoCrop && (
               <div className="absolute inset-0 border-2 border-dashed border-[#A6CAF0] pointer-events-none flex items-center justify-center">
                  <span className="text-[8px] text-[#000080] dark:text-blue-400 font-bold uppercase bg-white/20 dark:bg-dark-input/20 px-1">1:1 Auto-Crop</span>
               </div>
            )}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-3">
             <button onClick={handleRotate} className="btn-classic text-xs py-2 flex items-center justify-center gap-2">
                <span>🔄</span> Rotate 90°
             </button>
             <button onClick={() => setAutoCrop(!autoCrop)} className={`btn-classic text-xs py-2 flex items-center justify-center gap-2 ${autoCrop ? 'bg-[#A6CAF0]/20 ring-1 ring-[#A6CAF0]' : ''}`}>
                <span>📐</span> Auto-Crop (1:1)
             </button>
             <button onClick={() => setFlipH(!flipH)} className={`btn-classic text-xs py-2 flex items-center justify-center gap-2 ${flipH ? 'bg-[#A6CAF0]/20 ring-1 ring-[#A6CAF0]' : ''}`}>
                <span>↔️</span> Flip Horizontal
             </button>
             <button onClick={() => setFlipV(!flipV)} className={`btn-classic text-xs py-2 flex items-center justify-center gap-2 ${flipV ? 'bg-[#A6CAF0]/20 ring-1 ring-[#A6CAF0]' : ''}`}>
                <span>↕️</span> Flip Vertical
             </button>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 p-2 text-[10px] text-red-800 font-bold shadow-inner">
               ✗ {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-400">
             <button onClick={onClose} className="px-6 py-1.5 text-xs font-bold bg-[#c0c0c0] dark:bg-dark-surface border-t-2 border-l-2 border-white dark:border-dark-highlight border-b-2 border-r-2 border-gray-800 dark:border-dark-shadow hover:bg-gray-100 dark:hover:bg-dark-surface-alt">Cancel</button>
             <button 
               onClick={handleSave} 
               disabled={isProcessing}
               className="btn-gjc px-8 py-1.5 text-xs"
             >
                {isProcessing ? 'Optimizing...' : 'Apply & Save'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
