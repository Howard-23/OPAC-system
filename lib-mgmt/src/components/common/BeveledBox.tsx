import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BeveledBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'raised' | 'sunken';
  children: React.ReactNode;
  padding?: string;
}

export const BeveledBox = React.forwardRef<HTMLDivElement, BeveledBoxProps>(({ 
  variant = 'raised', 
  children, 
  className,
  padding = 'p-1',
  ...props
}, ref) => {
  return (
    <div 
      ref={ref}
      className={cn(
        padding,
        variant === 'raised' ? 'shadow-bevel-raised' : 'shadow-bevel-sunken',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

BeveledBox.displayName = 'BeveledBox';
