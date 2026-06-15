import React from 'react';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  BookPlus,
  BookmarkPlus,
  DatabaseBackup,
  Download,
  Edit,
  FilePlus,
  Info,
  LayoutDashboard,
  LogOut,
  ScanBarcode,
  Settings,
  TrendingUp,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import type { ToolbarProps } from '../../components/dashboard/Toolbar';

export const V2ActionDeck: React.FC<ToolbarProps> = ({
  onAuthority,
  onAbout,
  onDelete,
  onExport,
  onEdit,
  onCheckout,
  onReturn,
  onDashboard,
  onPayment,
  onAudit,
  onFinancialReports,
  onAcquisitions,
  onReservation,
  onSettings,
  onImportMdb,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, hasPermission } = useAuth();
  const isPatrons = location.pathname.startsWith('/patrons');

  const actionCards: Array<{
    key: string;
    icon: typeof LayoutDashboard;
    label: string;
    category: string;
    description: string;
    permission?: string;
    onClick?: () => void;
    active?: boolean;
  }> = [
    {
      key: 'catalog',
      icon: LayoutDashboard,
      label: 'Catalog',
      category: 'Catalog',
      description: 'Browse titles, holdings, and bibliographic records.',
      permission: 'catalog:read',
      onClick: () => navigate('/dashboard'),
      active: !isPatrons,
    },
    {
      key: 'patrons',
      icon: Users,
      label: 'Patrons',
      category: 'Patrons',
      description: 'Open reader accounts, fines, and borrowing details.',
      permission: 'patrons:read',
      onClick: () => navigate('/patrons'),
      active: isPatrons,
    },
    {
      key: 'new',
      icon: FilePlus,
      label: isPatrons ? 'New Patron' : 'New Record',
      category: isPatrons ? 'Patrons' : 'Cataloging',
      description: isPatrons ? 'Create a new borrower account.' : 'Add a new catalog entry to the collection.',
      permission: isPatrons ? 'patrons:write' : 'catalog:write',
      onClick: () => navigate(isPatrons ? '/patrons/new' : '/catalog/new'),
    },
    {
      key: 'edit',
      icon: Edit,
      label: 'Edit',
      category: 'Update',
      description: isPatrons ? 'Update the selected patron profile.' : 'Revise the selected catalog record.',
      permission: isPatrons ? 'patrons:write' : 'catalog:write',
      onClick: onEdit,
    },
    {
      key: 'delete',
      icon: Trash2,
      label: 'Remove',
      category: 'Update',
      description: isPatrons ? 'Remove the selected patron entry.' : 'Delete the selected catalog record.',
      permission: isPatrons ? 'patrons:delete' : 'catalog:delete',
      onClick: onDelete,
    },
    {
      key: 'borrow',
      icon: ArrowUpRight,
      label: 'Borrow',
      category: 'Circulation',
      description: 'Issue the selected item to a reader.',
      permission: 'circulation:write',
      onClick: onCheckout,
    },
    {
      key: 'return',
      icon: ArrowDownLeft,
      label: 'Return',
      category: 'Circulation',
      description: 'Process returned items and update status.',
      permission: 'circulation:write',
      onClick: onReturn,
    },
    {
      key: 'overview',
      icon: Activity,
      label: 'Overview',
      category: 'Activity',
      description: 'Review current borrowing activity at a glance.',
      permission: 'circulation:read',
      onClick: onDashboard,
    },
    {
      key: 'fine',
      icon: Wallet,
      label: 'Fine Payment',
      category: 'Fines',
      description: 'Record or settle an outstanding fine.',
      permission: 'circulation:write',
      onClick: onPayment,
    },
    {
      key: 'audit',
      icon: ScanBarcode,
      label: 'Inventory Audit',
      category: 'Inventory',
      description: 'Check stock accuracy and shelf availability.',
      permission: 'inventory:audit',
      onClick: onAudit,
    },
    {
      key: 'reports',
      icon: TrendingUp,
      label: 'Reports',
      category: 'Insights',
      description: 'View summaries for circulation and finance.',
      permission: 'reports:read',
      onClick: onFinancialReports,
    },
    {
      key: 'export',
      icon: Download,
      label: 'Export',
      category: 'Insights',
      description: 'Download the current data for reporting.',
      permission: 'reports:read',
      onClick: onExport,
    },
    {
      key: 'authority',
      icon: BookOpen,
      label: 'Authority Files',
      category: 'Cataloging',
      description: 'Maintain controlled terms and headings.',
      permission: 'authorities:write',
      onClick: onAuthority,
    },
    {
      key: 'acquisitions',
      icon: BookPlus,
      label: 'New Items',
      category: 'Acquisitions',
      description: 'Register incoming books and materials.',
      permission: 'catalog:write',
      onClick: onAcquisitions,
    },
    {
      key: 'reservation',
      icon: BookmarkPlus,
      label: 'Reserve',
      category: 'Reservations',
      description: 'Place a hold request for a patron.',
      permission: 'reservations:write',
      onClick: onReservation,
    },
    {
      key: 'settings',
      icon: Settings,
      label: 'Settings',
      category: 'Administration',
      description: 'Adjust system preferences and library setup.',
      permission: 'settings:write',
      onClick: onSettings,
    },
    {
      key: 'import',
      icon: DatabaseBackup,
      label: 'Import Data',
      category: 'Administration',
      description: 'Bring legacy records into the system.',
      permission: 'system:import',
      onClick: onImportMdb,
    },
    {
      key: 'about',
      icon: Info,
      label: 'About',
      category: 'Help',
      description: 'View application details and support notes.',
      onClick: onAbout,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {actionCards
        .filter((card) => !card.permission || hasPermission(card.permission))
        .map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.key}
              type="button"
              onClick={card.onClick}
              className={`group flex min-h-[148px] flex-col gap-3 rounded-[24px] border px-4 py-4 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] ${
                card.active
                  ? 'border-cyan-300 bg-cyan-50/80 shadow-[0_14px_30px_rgba(14,165,233,0.14)]'
                  : 'border-slate-200 bg-slate-50/90 hover:border-cyan-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white transition ${
                    card.active ? 'bg-cyan-600' : 'bg-slate-900 group-hover:bg-cyan-700'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{card.category}</p>
                  <p className="mt-1 text-base font-semibold leading-5 text-slate-900">{card.label}</p>
                </div>
              </div>
              <p className="text-sm leading-5 text-slate-600">{card.description}</p>
            </button>
          );
        })}

      <button
        type="button"
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="flex min-h-[148px] flex-col gap-3 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-white hover:shadow-[0_14px_30px_rgba(244,63,94,0.12)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white">
            <LogOut size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-400">Session</p>
            <p className="mt-1 text-base font-semibold leading-5 text-rose-900">Sign Out</p>
          </div>
        </div>
        <p className="text-sm leading-5 text-rose-700">End the current session and return to the login screen.</p>
      </button>
    </div>
  );
};
