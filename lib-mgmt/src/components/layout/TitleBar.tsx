import React from 'react';
import { UserProfile } from './UserProfile';

interface TitleBarProps {
  title?: string;
  onClose?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  title = 'infoLib Library Management System',
  onClose
}) => {
  return (
    <div className="h-8 bg-gradient-to-b from-[#A6CAF0] to-[#7FA8E0] dark:from-[#1E3A6E] dark:to-[#2A4F8A] flex items-center justify-between px-2 select-none">
      {/* Left: App Icon and Title */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-[#D4D0C8] dark:bg-dark-panel border border-[#808080] dark:border-dark-border-dark shadow-bevel-raised flex items-center justify-center">
          <div className="w-2 h-2 bg-[#000080] dark:bg-dark-accent rounded-sm" />
        </div>
        <span className="text-white dark:text-dark-text text-sm font-medium drop-shadow-sm">
          {title}
        </span>
      </div>

      {/* Right: User Profile and Close Button */}
      <div className="flex items-center gap-1">
        <UserProfile />
        {onClose && (
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#D4D0C8] dark:bg-dark-panel border border-[#808080] dark:border-dark-border-dark shadow-bevel-raised flex items-center justify-center hover:bg-[#E0E0E0] dark:hover:bg-dark-surface-alt active:shadow-bevel-sunken"
            aria-label="Close"
          >
            <span className="text-black dark:text-dark-text text-[10px] font-bold">✕</span>
          </button>
        )}
      </div>
    </div>
  );
};
