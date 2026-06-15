import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { invoke } from '../../lib/runtimeBridge';
import { useCatalogStore } from '../../stores/catalogStore';
import { usePatronStore } from '../../stores/patronStore';
import { useSyncStore } from '../../stores/syncStore';

export const useAppShell = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPatrons = location.pathname.startsWith('/patrons');

  const records = useCatalogStore((state) => state.records);
  const selectedId = useCatalogStore((state) => state.selectedId);
  const deleteRecord = useCatalogStore((state) => state.deleteRecord);
  const isEditDialogOpen = useCatalogStore((state) => state.isEditDialogOpen);
  const editingControlNo = useCatalogStore((state) => state.editingControlNo);
  const setEditDialogOpen = useCatalogStore((state) => state.setEditDialogOpen);
  const setEditingControlNo = useCatalogStore((state) => state.setEditingControlNo);

  const patrons = usePatronStore((state) => state.patrons);
  const selectedIdno = usePatronStore((state) => state.selectedIdno);
  const deletePatron = usePatronStore((state) => state.deletePatron);

  const autoSyncEnabled = useSyncStore((state) => state.autoSyncEnabled);
  const syncNow = useSyncStore((state) => state.syncNow);

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

  React.useEffect(() => {
    if (!autoSyncEnabled) {
      return;
    }

    void syncNow();

    const interval = setInterval(() => {
      void syncNow();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoSyncEnabled, syncNow]);

  const selectedRecord = records.find((record) => record.id === selectedId);
  const selectedPatron = patrons.find((patron) => patron.idno === selectedIdno);

  const confirmDelete = () => {
    if (isPatrons) {
      if (selectedIdno) {
        void deletePatron(selectedIdno);
        setShowDelete(false);
      }
      return;
    }

    if (selectedId !== undefined) {
      void deleteRecord(selectedId);
      setShowDelete(false);
    }
  };

  const handleEdit = () => {
    if (isPatrons) {
      if (selectedIdno) {
        navigate(`/patrons/edit/${selectedIdno}`);
      } else {
        alert('Please select a patron to edit.');
      }
      return;
    }

    if (!selectedId) {
      alert('Please select a record to edit.');
      return;
    }

    const record = records.find((item) => item.id === selectedId);
    if (record?.controlno) {
      setEditingControlNo(record.controlno);
      setEditDialogOpen(true);
    }
  };

  const handleClose = () => {
    void invoke('quit_app').catch((error) => {
      console.error('Tauri quit failed:', error);
      logout();
    });
  };

  return {
    handleClose,
    isPatrons,
    dialogs: {
      showAuthority,
      showAbout,
      showDelete,
      showExport,
      showCheckout,
      showReturn,
      showCircDashboard,
      showPayment,
      showFinancialReports,
      showAcquisitions,
      showAudit,
      showReservation,
      showSettings,
      showSyncLogs,
      showImportMdb,
      isEditDialogOpen,
      editingControlNo,
      selectedRecord,
      selectedPatron,
    },
    actions: {
      confirmDelete,
      closeEditDialog: () => setEditDialogOpen(false),
      closeAuthority: () => setShowAuthority(false),
      closeAbout: () => setShowAbout(false),
      closeDelete: () => setShowDelete(false),
      closeExport: () => setShowExport(false),
      closeCheckout: () => setShowCheckout(false),
      closeReturn: () => setShowReturn(false),
      closeCircDashboard: () => setShowCircDashboard(false),
      closePayment: () => setShowPayment(false),
      closeFinancialReports: () => setShowFinancialReports(false),
      closeAcquisitions: () => setShowAcquisitions(false),
      closeAudit: () => setShowAudit(false),
      closeReservation: () => setShowReservation(false),
      closeSettings: () => setShowSettings(false),
      closeSyncLogs: () => setShowSyncLogs(false),
      closeImportMdb: () => setShowImportMdb(false),
    },
    toolbarProps: {
      onAuthority: () => setShowAuthority(true),
      onAbout: () => setShowAbout(true),
      onExport: () => setShowExport(true),
      onEdit: handleEdit,
      onCheckout: () => {
        if (isPatrons) {
          if (selectedIdno) {
            setShowCheckout(true);
          } else {
            alert('Please select a patron to issue items to.');
          }
        } else {
          alert('Please switch to Patrons view to manage circulation.');
        }
      },
      onReturn: () => setShowReturn(true),
      onDashboard: () => setShowCircDashboard(true),
      onPayment: () => {
        if (isPatrons) {
          if (selectedIdno) {
            setShowPayment(true);
          } else {
            alert('Please select a patron to record payment.');
          }
        } else {
          alert('Please switch to Patrons view to manage payments.');
        }
      },
      onDelete: () => {
        if (isPatrons) {
          if (selectedIdno) {
            setShowDelete(true);
          } else {
            alert('Please select a patron to delete.');
          }
        } else {
          if (selectedId) {
            setShowDelete(true);
          } else {
            alert('Please select a record to delete.');
          }
        }
      },
      onAudit: () => setShowAudit(true),
      onFinancialReports: () => setShowFinancialReports(true),
      onAcquisitions: () => setShowAcquisitions(true),
      onReservation: () => setShowReservation(true),
      onSettings: () => setShowSettings(true),
      onShowLogs: () => setShowSyncLogs(true),
      onImportMdb: () => setShowImportMdb(true),
    },
  };
};
