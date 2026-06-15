import React from 'react';
import { FilePlus, Trash2, Download, BookOpen, Info, LogOut, Users, LayoutDashboard, Edit, ArrowUpRight, ArrowDownLeft, Activity, Wallet, ScanBarcode, TrendingUp, BookPlus, BookmarkPlus, Settings, ToggleLeft, DatabaseBackup } from 'lucide-react';
import { ToolbarItem } from './ToolbarItem';
import { SyncComboButton } from './SyncComboButton';
import { useAuth } from '../../hooks/useAuth';
import { isDesktopRuntime } from '../../lib/runtimeBridge';
import { useNavigate, useLocation } from 'react-router-dom';

export interface ToolbarProps {
  onAuthority?: () => void;
  onAbout?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  onEdit?: () => void;
  onCheckout?: () => void;
  onReturn?: () => void;
  onDashboard?: () => void;
  onPayment?: () => void;
  onAudit?: () => void;
  onFinancialReports?: () => void;
  onAcquisitions?: () => void;
  onReservation?: () => void;
  onSettings?: () => void;
  onShowLogs?: () => void;
  onImportMdb?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAuthority, onAbout, onDelete, onExport, onEdit, onCheckout, onReturn, onDashboard, onPayment, onAudit, onFinancialReports, onAcquisitions, onReservation, onSettings, onShowLogs, onImportMdb }) => {
  const { logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [isAdvanced, setIsAdvanced] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const location = useLocation();
  const isPatrons = location.pathname.startsWith('/patrons');
  const canSeeCatalog = hasPermission('catalog:read');
  const canSeePatrons = hasPermission('patrons:read');
  const canCreate = hasPermission(isPatrons ? 'patrons:write' : 'catalog:write');
  const canEdit = hasPermission(isPatrons ? 'patrons:write' : 'catalog:write');
  const canDelete = hasPermission(isPatrons ? 'patrons:delete' : 'catalog:delete');
  const canExport = hasPermission('reports:read');
  const canAuthority = hasPermission('authorities:write');
  const canBorrow = hasPermission('circulation:write');
  const canOverview = hasPermission('circulation:read');
  const canPayFine = hasPermission('circulation:write');
  const canAudit = hasPermission('inventory:audit');
  const canReports = hasPermission('reports:read');
  const canAcquisitions = hasPermission('catalog:write');
  const canReservation = hasPermission('reservations:write');
  const canImport = hasPermission('system:import');
  const canSettings = hasPermission('settings:write');
  const desktopOnlyControls = isDesktopRuntime();

  const handleNew = () => {
    if (isPatrons) navigate('/patrons/new');
    else navigate('/catalog/new');
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-classic-grey dark:bg-dark-surface border-b border-white dark:border-dark-highlight shadow-[0_1px_0_#808080] dark:shadow-[0_1px_0_#1A1A1A] overflow-x-auto">
      {isAdvanced && (
        <>
          {canSeeCatalog && (
            <ToolbarItem 
              icon={LayoutDashboard} 
              label="Catalog" 
              onClick={() => navigate('/dashboard')} 
            />
          )}
          {canSeePatrons && (
            <ToolbarItem 
              icon={Users} 
              label="Patrons" 
              onClick={() => navigate('/patrons')} 
            />
          )}
          {canBorrow && (
            <ToolbarItem 
              icon={ArrowUpRight} 
              label="Borrow" 
              onClick={onCheckout} 
            />
          )}
          {canBorrow && (
            <ToolbarItem 
              icon={ArrowDownLeft} 
              label="Return" 
              onClick={onReturn} 
            />
          )}
          {canOverview && (
            <ToolbarItem 
              icon={Activity} 
              label="Overview" 
              onClick={onDashboard} 
            />
          )}
          {canPayFine && (
            <ToolbarItem 
              icon={Wallet} 
              label="Pay Fine" 
              onClick={onPayment} 
            />
          )}
          {canAudit && (
            <ToolbarItem 
              icon={ScanBarcode} 
              label="Audit" 
              onClick={onAudit} 
            />
          )}
          {canReports && (
            <ToolbarItem 
              icon={TrendingUp} 
              label="Reports" 
              onClick={onFinancialReports} 
            />
          )}
          {canAcquisitions && (
            <ToolbarItem 
              icon={BookPlus} 
              label="New Items" 
              onClick={onAcquisitions} 
            />
          )}
          {canReservation && (
            <ToolbarItem 
              icon={BookmarkPlus} 
              label="Reserve" 
              onClick={onReservation} 
            />
          )}
          {desktopOnlyControls && canImport && (
            <ToolbarItem 
              icon={DatabaseBackup} 
              label="Import" 
              onClick={onImportMdb} 
            />
          )}
          <div className="w-[1px] h-16 bg-gray-400 dark:bg-dark-border-light mx-1 shadow-[1px_0_0_white] dark:shadow-[1px_0_0_#404040]" />
        </>
      )}

      {canCreate && (
        <ToolbarItem 
          icon={FilePlus} 
          label="New" 
          onClick={handleNew} 
        />
      )}
      {isAdvanced && canEdit && (
        <ToolbarItem 
          icon={Edit} 
          label="Edit" 
          onClick={onEdit} 
        />
      )}
      {canDelete && (
        <ToolbarItem 
          icon={Trash2} 
          label="Delete" 
          onClick={onDelete} 
        />
      )}
      {canExport && (
        <ToolbarItem 
          icon={Download} 
          label="Export" 
          onClick={onExport} 
        />
      )}
      
      <div className="w-[1px] h-16 bg-gray-400 dark:bg-dark-border-light mx-1 shadow-[1px_0_0_white] dark:shadow-[1px_0_0_#404040]" />
      
      {canAuthority && (
        <ToolbarItem 
          icon={BookOpen} 
          label="Authority" 
          onClick={onAuthority} 
        />
      )}
      <ToolbarItem 
        icon={Info} 
        label="About" 
        onClick={onAbout} 
      />
      <ToolbarItem 
        icon={LogOut} 
        label="Exit" 
        onClick={handleLogout} 
      />
      
      <div className="w-[1px] h-16 bg-gray-400 dark:bg-dark-border-light mx-1 shadow-[1px_0_0_white] dark:shadow-[1px_0_0_#404040]" />
      
      <SyncComboButton onShowLogs={onShowLogs || (() => {})} />
      
      {/* Spacer */}
      <div className="flex-1 min-w-[20px]" />
      
      {/* Settings Button */}
      {desktopOnlyControls && canSettings && (
        <ToolbarItem 
          icon={Settings} 
          label="Settings" 
          onClick={onSettings} 
        />
      )}
      
      {/* Mode Toggle Button */}
      <ToolbarItem 
        icon={ToggleLeft} 
        label={isAdvanced ? "Basic Mode" : "Adv. Mode"} 
        onClick={() => setIsAdvanced(!isAdvanced)} 
        className={isAdvanced ? "!shadow-bevel-sunken bg-blue-100/30 border border-blue-500" : "border-2 border-dashed border-gray-500"}
      />
      
      {/* Branding Logo Placeholder */}
      <div className="pr-4 text-right">
        <h1 className="text-xl font-bold tracking-tighter text-classic-blue dark:text-dark-accent italic">
          infoLib.
        </h1>
        <p className="text-[9px] text-gray-600 dark:text-dark-text-muted font-bold uppercase">
          Library Information System
        </p>
      </div>
    </div>
  );
};
