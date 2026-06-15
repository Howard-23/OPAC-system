import React from 'react';

import { AIChatBadge } from '../../components/ai/AIChatBadge';
import { AuthorityDialog } from '../../components/catalog/AuthorityDialog';
import { EditCatalogDialog } from '../../components/catalog/EditCatalogDialog';
import { AboutDialog } from '../../components/layout/AboutDialog';
import { DeleteDialog } from '../../components/dashboard/DeleteDialog';
import { ExportDialog } from '../../components/dashboard/ExportDialog';
import { SyncLogsDialog } from '../../components/dashboard/SyncLogsDialog';
import { CheckoutDialog } from '../../components/circulation/CheckoutDialog';
import { ReturnDialog } from '../../components/circulation/ReturnDialog';
import { CirculationDashboard } from '../../components/circulation/CirculationDashboard';
import { ReservationDialog } from '../../components/circulation/ReservationDialog';
import { PaymentDialog } from '../../components/patrons/PaymentDialog';
import { FinancialReportsDialog } from '../../components/patrons/FinancialReportsDialog';
import { AcquisitionsDialog } from '../../components/inventory/AcquisitionsDialog';
import { AuditDialog } from '../../components/inventory/AuditDialog';
import { SettingsPage } from '../../pages/settings/SettingsPage';
import { ImportMdbDialog } from '../../components/management/ImportMdbDialog';
import { isDesktopRuntime } from '../../lib/runtimeBridge';

interface GlobalDialogsProps {
  dialogs: {
    showAuthority: boolean;
    showAbout: boolean;
    showDelete: boolean;
    showExport: boolean;
    showCheckout: boolean;
    showReturn: boolean;
    showCircDashboard: boolean;
    showPayment: boolean;
    showFinancialReports: boolean;
    showAcquisitions: boolean;
    showAudit: boolean;
    showReservation: boolean;
    showSettings: boolean;
    showSyncLogs: boolean;
    showImportMdb: boolean;
    isEditDialogOpen: boolean;
    editingControlNo: string | null;
    selectedRecord?: { controlno?: string; id: number } | undefined;
    selectedPatron?: { idno: string } | undefined;
  };
  actions: {
    confirmDelete: () => void;
    closeEditDialog: () => void;
    closeAuthority: () => void;
    closeAbout: () => void;
    closeDelete: () => void;
    closeExport: () => void;
    closeCheckout: () => void;
    closeReturn: () => void;
    closeCircDashboard: () => void;
    closePayment: () => void;
    closeFinancialReports: () => void;
    closeAcquisitions: () => void;
    closeAudit: () => void;
    closeReservation: () => void;
    closeSettings: () => void;
    closeSyncLogs: () => void;
    closeImportMdb: () => void;
  };
  isPatrons: boolean;
}

export const GlobalDialogs: React.FC<GlobalDialogsProps> = ({ dialogs, actions, isPatrons }) => (
  <>
    {dialogs.showAuthority && <AuthorityDialog onClose={actions.closeAuthority} />}
    {dialogs.showAbout && <AboutDialog onClose={actions.closeAbout} />}
    {dialogs.showExport && <ExportDialog onClose={actions.closeExport} />}
    {dialogs.showCheckout && <CheckoutDialog onClose={actions.closeCheckout} />}
    {dialogs.showReturn && <ReturnDialog onClose={actions.closeReturn} />}
    {dialogs.showCircDashboard && <CirculationDashboard onClose={actions.closeCircDashboard} />}
    {dialogs.showPayment && <PaymentDialog onClose={actions.closePayment} />}
    {dialogs.showFinancialReports && <FinancialReportsDialog onClose={actions.closeFinancialReports} />}
    {dialogs.showAcquisitions && <AcquisitionsDialog onClose={actions.closeAcquisitions} />}
    {dialogs.showAudit && <AuditDialog onClose={actions.closeAudit} />}
    {dialogs.showReservation && <ReservationDialog onClose={actions.closeReservation} />}
    {dialogs.showDelete && !isPatrons && dialogs.selectedRecord && (
      <DeleteDialog
        controlNo={dialogs.selectedRecord.controlno || dialogs.selectedRecord.id.toString()}
        onConfirm={actions.confirmDelete}
        onCancel={actions.closeDelete}
      />
    )}
    {dialogs.showDelete && isPatrons && dialogs.selectedPatron && (
      <DeleteDialog
        controlNo={dialogs.selectedPatron.idno}
        onConfirm={actions.confirmDelete}
        onCancel={actions.closeDelete}
      />
    )}
    {dialogs.isEditDialogOpen && dialogs.editingControlNo && (
      <EditCatalogDialog controlno={dialogs.editingControlNo} onClose={actions.closeEditDialog} />
    )}
    {dialogs.showSettings && <SettingsPage onClose={actions.closeSettings} />}
    {dialogs.showSyncLogs && <SyncLogsDialog onClose={actions.closeSyncLogs} />}
    {dialogs.showImportMdb && <ImportMdbDialog onClose={actions.closeImportMdb} />}
    {isDesktopRuntime() && <AIChatBadge />}
  </>
);
