import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useCatalogStore } from '../../stores/catalogStore';

export const RecordNavigator: React.FC = () => {
  const { currentPage, totalRecords, setPage } = useCatalogStore();
  const totalPages = Math.ceil(totalRecords / 20) || 1;

  const handleFirst = () => setPage(1);
  const handleLast = () => setPage(totalPages);
  const handlePrev = () => currentPage > 1 && setPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setPage(currentPage + 1);

  return (
    <div className="flex items-center gap-1 bg-[#D4D0C8] dark:bg-dark-surface px-2 py-0.5 border-t border-white dark:border-dark-highlight shadow-[0_-1px_0_#808080] dark:shadow-[0_-1px_0_#1A1A1A]">
      <div className="flex gap-0.5">
        <button 
          onClick={handleFirst} 
          disabled={currentPage === 1}
          className="btn-classic px-1.5 h-6 flex items-center justify-center disabled:opacity-50"
        >
          <ChevronsLeft size={14} />
        </button>
        <button 
          onClick={handlePrev} 
          disabled={currentPage === 1}
          className="btn-classic px-1.5 h-6 flex items-center justify-center disabled:opacity-50"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 px-2 text-xs font-bold whitespace-nowrap dark:text-dark-text">
        <span>Record:</span>
        <input 
          type="text" 
          value={currentPage}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 1 && val <= totalPages) setPage(val);
          }}
          className="input-classic w-10 h-5 text-center px-0 font-bold text-blue-800 dark:text-dark-accent"
        />
        <span>of {totalPages}</span>
      </div>

      <div className="flex gap-0.5">
        <button 
          onClick={handleNext} 
          disabled={currentPage === totalPages}
          className="btn-classic px-1.5 h-6 flex items-center justify-center disabled:opacity-50"
        >
          <ChevronRight size={14} />
        </button>
        <button 
          onClick={handleLast} 
          disabled={currentPage === totalPages}
          className="btn-classic px-1.5 h-6 flex items-center justify-center disabled:opacity-50"
        >
          <ChevronsRight size={14} />
        </button>
      </div>

      <div className="ml-4 h-5 w-[1px] bg-gray-400 dark:bg-dark-border-light shadow-[1px_0_0_white] dark:shadow-[1px_0_0_#404040]" />
      <span className="ml-2 text-[10px] text-gray-600 dark:text-dark-text-muted italic">
        Total: {totalRecords} Records
      </span>
    </div>
  );
};
