import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ChevronDown, LogOut, User } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Win 95 Style Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-6 flex items-center gap-1.5 px-1 bg-[#D4D0C8] dark:bg-dark-panel border border-[#808080] dark:border-dark-border-dark shadow-bevel-raised hover:bg-[#E0E0E0] dark:hover:bg-dark-surface-alt active:shadow-bevel-sunken transition-all group"
      >
        <div className="w-4 h-4 bg-white dark:bg-dark-surface border border-[#808080] dark:border-dark-border-dark overflow-hidden flex items-center justify-center">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={12} className="text-[#808080] dark:text-dark-text-muted" />
          )}
        </div>
        
        <div className="flex flex-col items-start leading-none pr-1">
          <span className="text-[10px] font-bold text-black dark:text-dark-text truncate max-w-[80px]">
            {user.displayName}
          </span>
          {user.primaryRole && (
            <span className="text-[8px] text-[#404040] dark:text-dark-text-muted uppercase tracking-tighter">
              {user.primaryRole}
            </span>
          )}
        </div>
        
        <div className="border-l border-[#808080] dark:border-dark-border-dark h-full pl-1 flex items-center">
          <ChevronDown size={10} className={`text-black dark:text-dark-text transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Win 95 Style Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-0.5 w-48 bg-[#D4D0C8] dark:bg-dark-panel border-2 border-[#808080] dark:border-dark-border-dark shadow-bevel-raised z-50 animate-in fade-in slide-in-from-top-1">
          <div className="p-3 border-b border-[#808080] dark:border-dark-border-dark bg-[#A6CAF0]/20 dark:bg-dark-accent/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white dark:bg-dark-surface border-2 border-[#808080] dark:border-dark-border-dark shadow-bevel-sunken overflow-hidden flex items-center justify-center">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full" />
                ) : (
                  <User size={20} className="text-[#808080] dark:text-dark-text-muted" />
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-black dark:text-dark-text truncate">
                  {user.displayName}
                </span>
                <span className="text-[10px] text-[#404040] dark:text-dark-text-muted truncate">
                  {user.email || 'Local Account'}
                </span>
                <span className="mt-1 text-[9px] bg-[#000080] dark:bg-dark-accent text-white px-1.5 py-0.5 rounded-sm inline-block w-fit">
                  {user.primaryRole || 'User'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-1">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-black dark:text-dark-text hover:bg-[#000080] hover:text-white dark:hover:bg-dark-accent group transition-colors text-left"
            >
              <LogOut size={14} className="text-black dark:text-dark-text group-hover:text-white" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
