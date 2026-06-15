import React from 'react';

import { BeveledBox } from '../../components/common/BeveledBox';
import { Toolbar } from '../../components/dashboard/Toolbar';
import { TitleBar } from '../../components/layout/TitleBar';
import { GlobalDialogs } from '../shared/GlobalDialogs';
import { useAppShell } from '../shared/useAppShell';

interface V1LayoutProps {
  children: React.ReactNode;
}

const V1Layout: React.FC<V1LayoutProps> = ({ children }) => {
  const shell = useAppShell();

  return (
    <div className="min-h-screen bg-[#808080] dark:bg-[#1A1A1A] p-0.5 sm:p-2 md:p-4 flex items-center justify-center">
      <BeveledBox variant="raised" className="w-full h-full max-w-7xl mx-auto flex flex-col bg-[#D4D0C8] dark:bg-dark-surface">
        <TitleBar title="infoLib Library Management System" onClose={shell.handleClose} />

        <div className="flex flex-col flex-1 overflow-hidden">
          <header id="layout-toolbar">
            <Toolbar {...shell.toolbarProps} />
          </header>

          <main className="flex-1 overflow-auto p-2">{children}</main>
        </div>
      </BeveledBox>

      <GlobalDialogs dialogs={shell.dialogs} actions={shell.actions} isPatrons={shell.isPatrons} />
    </div>
  );
};

export default V1Layout;
