import React from 'react';
import { TitleBar } from './TitleBar';
import { Toolbar } from '../dashboard/Toolbar';
import { BeveledBox } from '../common/BeveledBox';
import { AuthorityDialog } from '../catalog/AuthorityDialog';
import { DeleteDialog } from '../dashboard/DeleteDialog';
import { ExportDialog } from '../dashboard/ExportDialog';
import { CheckoutDialog } from '../circulation/CheckoutDialog';
import { ReturnDialog } from '../circulation/ReturnDialog';
import { CirculationDashboard } from '../circulation/CirculationDashboard';
import { PaymentDialog } from '../patrons/PaymentDialog';
import { FinancialReportsDialog } from '../patrons/FinancialReportsDialog';
import { AcquisitionsDialog } from '../inventory/AcquisitionsDialog';
import { AuditDialog } from '../inventory/AuditDialog';
import { ReservationDialog } from '../circulation/ReservationDialog';
import { EditCatalogDialog } from '../catalog/EditCatalogDialog';
import { AIChatBadge } from '../ai/AIChatBadge';
import { SettingsPage } from '../../pages/settings/SettingsPage';
import { AboutDialog } from './AboutDialog';
import { SyncLogsDialog } from '../dashboard/SyncLogsDialog';
import { ImportMdbDialog } from '../management/ImportMdbDialog';
import { useAuthStore } from '../../stores/authStore';
import { useCatalogStore } from '../../stores/catalogStore';
import { usePatronStore } from '../../stores/patronStore';
import { useSyncStore } from '../../stores/syncStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { invoke } from '../../lib/runtimeBridge';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { records, selectedId, deleteRecord, isEditDialogOpen, editingControlNo, setEditDialogOpen, setEditingControlNo } = useCatalogStore();
  const { patrons, selectedIdno, deletePatron } = usePatronStore();
  const { autoSyncEnabled, syncNow } = useSyncStore();
  const location = useLocation();
  const isPatrons = location.pathname.startsWith('/patrons');

  const [showAuthority, setShowAuthority] = React.useState(false);
  const [showAbout, setShowAbout] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [showExport, setShowExport] = React.useState(false);
  const [showCheckout, setShowCheckout] = React.useState(false);
  const [showReturn, setShowReturn] = React.useState(false);
  const [showCircDashboard, setShowCircDashboard] = React.useState(false);
  const [showPayment, setShowPayment] = React.useState(false);
  const [showFinancialReports, setShowFinancialReports] = React.useState(false);
  const [showAcquisitions, setShowAcquisitions] = React.useState(false);
  const [showAudit, setShowAudit] = React.useState(false);
  const [showReservation, setShowReservation] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showSyncLogs, setShowSyncLogs] = React.useState(false);
  const [showImportMdb, setShowImportMdb] = React.useState(false);

  // Auto-Sync Effect
  React.useEffect(() => {
    if (!autoSyncEnabled) return;
    
    // Initial sync
    syncNow();
    
    // Periodic sync every 5 minutes
    const interval = setInterval(() => {
      syncNow();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [autoSyncEnabled, syncNow]);

  const selectedRecord = records.find(r => r.id === selectedId);
  const selectedPatron = patrons.find(p => p.idno === selectedIdno);

  const confirmDelete = () => {
    if (isPatrons) {
      if (selectedIdno) {
        deletePatron(selectedIdno);
        setShowDelete(false);
      }
    } else {
      if (selectedId !== undefined) {
        deleteRecord(selectedId);
        setShowDelete(false);
      }
    }
  };

  const handleEdit = () => {
    if (isPatrons) {
      if (selectedIdno) navigate(`/patrons/edit/${selectedIdno}`);
      else alert('Please select a patron to edit.');
    } else {
      if (selectedId) {
        const record = records.find(r => r.id === selectedId);
        if (record?.controlno) {
          setEditingControlNo(record.controlno);
          setEditDialogOpen(true);
        }
      } else {
        alert('Please select a record to edit.');
      }
    }
  };

  const handleClose = () => {
    try {
      invoke('quit_app');
    } catch (e) {
      console.error('Tauri quit failed:', e);
      logout(); // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#808080] dark:bg-[#1A1A1A] p-0.5 sm:p-2 md:p-4 flex items-center justify-center">
      <BeveledBox variant="raised" className="w-full h-full max-w-7xl mx-auto flex flex-col bg-[#D4D0C8] dark:bg-dark-surface">
        <TitleBar
          title="infoLib Library Management System"
          onClose={handleClose}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Toolbar Slot (T02) */}
          <header id="layout-toolbar">
            <Toolbar 
              onAuthority={() => setShowAuthority(true)} 
              onAbout={() => setShowAbout(true)} 
              onExport={() => setShowExport(true)}
              onEdit={handleEdit}
              onCheckout={() => {
                if (isPatrons) {
                  if (selectedIdno) setShowCheckout(true);
                  else alert('Please select a patron to issue items to.');
                } else {
                  alert('Please switch to Patrons view to manage circulation.');
                }
              }}
              onReturn={() => setShowReturn(true)}
              onDashboard={() => setShowCircDashboard(true)}
              onPayment={() => {
                if (isPatrons) {
                  if (selectedIdno) setShowPayment(true);
                  else alert('Please select a patron to record payment.');
                } else {
                  alert('Please switch to Patrons view to manage payments.');
                }
              }}
              onDelete={() => {
                if (isPatrons) {
                  if (selectedIdno) setShowDelete(true);
                  else alert('Please select a patron to delete.');
                } else {
                  if (selectedId) setShowDelete(true);
                  else alert('Please select a record to delete.');
                }
              }}
              onAudit={() => setShowAudit(true)}
              onFinancialReports={() => setShowFinancialReports(true)}
              onAcquisitions={() => setShowAcquisitions(true)}
              onReservation={() => setShowReservation(true)}
              onSettings={() => setShowSettings(true)}
              onShowLogs={() => setShowSyncLogs(true)}
              onImportMdb={() => setShowImportMdb(true)}
            />
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-2">
            {children}
          </main>
        </div>
      </BeveledBox>

      {/* Global Dialogs */}
      {showAuthority && <AuthorityDialog onClose={() => setShowAuthority(false)} />}
      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
      {showExport && <ExportDialog onClose={() => setShowExport(false)} />}
      {showCheckout && <CheckoutDialog onClose={() => setShowCheckout(false)} />}
      {showReturn && <ReturnDialog onClose={() => setShowReturn(false)} />}
      {showCircDashboard && <CirculationDashboard onClose={() => setShowCircDashboard(false)} />}
      {showPayment && <PaymentDialog onClose={() => setShowPayment(false)} />}
      {showFinancialReports && <FinancialReportsDialog onClose={() => setShowFinancialReports(false)} />}
      {showAcquisitions && <AcquisitionsDialog onClose={() => setShowAcquisitions(false)} />}
      {showAudit && <AuditDialog onClose={() => setShowAudit(false)} />}
      {showReservation && <ReservationDialog onClose={() => setShowReservation(false)} />}
      {showDelete && !isPatrons && selectedRecord && (
        <DeleteDialog 
          controlNo={selectedRecord.controlno || selectedRecord.id.toString()} 
          onConfirm={confirmDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
      {showDelete && isPatrons && selectedPatron && (
        <DeleteDialog 
          controlNo={selectedPatron.idno} 
          onConfirm={confirmDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
      {isEditDialogOpen && editingControlNo && (
        <EditCatalogDialog 
          controlno={editingControlNo} 
          onClose={() => setEditDialogOpen(false)} 
        />
      )}
      
      <AIChatBadge />
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
      {showSyncLogs && <SyncLogsDialog onClose={() => setShowSyncLogs(false)} />}
      {showImportMdb && <ImportMdbDialog onClose={() => setShowImportMdb(false)} />}
    </div>
  );
};
