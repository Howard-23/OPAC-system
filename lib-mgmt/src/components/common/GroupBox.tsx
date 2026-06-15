import React from 'react';

interface GroupBoxProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const GroupBox: React.FC<GroupBoxProps> = ({ label, children, className = '' }) => {
  return (
    <div className={`relative border border-white dark:border-dark-highlight shadow-[1px_1px_0_#808080,inset_1px_1px_0_#808080] dark:shadow-[1px_1px_0_#1A1A1A,inset_1px_1px_0_#1A1A1A] pt-4 p-4 ${className}`}>
      <span className="absolute -top-2.5 left-2 bg-classic-grey dark:bg-dark-surface px-1 text-xs font-bold text-gray-700 dark:text-dark-text">
        {label}
      </span>
      {children}
    </div>
  );
};
