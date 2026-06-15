import React from 'react';

interface FieldGroupProps {
  label: string;
  id: string;
  children: React.ReactNode;
  labelWidth?: string;
  className?: string;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({ 
  label, 
  id, 
  children, 
  labelWidth = 'w-24',
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label 
        htmlFor={id} 
        className={`${labelWidth} text-sm font-medium text-gray-700 dark:text-dark-text whitespace-nowrap`}
      >
        {label}
      </label>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
