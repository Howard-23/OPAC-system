import React from 'react';
import { Compass, Layers3, ShieldCheck } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { GlobalDialogs } from '../shared/GlobalDialogs';
import { useAppShell } from '../shared/useAppShell';
import { V2ActionDeck } from './V2ActionDeck';

interface V2LayoutProps {
  children: React.ReactNode;
}

const V2Layout: React.FC<V2LayoutProps> = ({ children }) => {
  const shell = useAppShell();
  const { setUiVersion, uiVersion, user } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.14),_transparent_28%),linear-gradient(180deg,#f4f7fb_0%,#eef3f8_100%)] p-3 text-slate-900 sm:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl flex-col gap-4 lg:min-h-[calc(100vh-2.5rem)]">
        <header className="overflow-hidden rounded-[30px] border border-white/70 bg-slate-950 text-white shadow-[0_28px_80px_rgba(15,23,42,0.32)]">
          <div className="grid gap-5 px-6 py-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-300">School Library System</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="font-['Trebuchet_MS','Segoe_UI',sans-serif] text-3xl font-bold tracking-tight sm:text-4xl">
                  Library Operations Center
                </h1>
                <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-200">
                  Desktop Workspace
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Manage catalog records, patron accounts, circulation, and reports from one responsive workspace designed for day-to-day school library operations.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric icon={Layers3} label="Interface" value={uiVersion.toUpperCase()} />
              <Metric icon={ShieldCheck} label="Role" value={user?.primaryRole ?? 'Guest'} />
              <Metric icon={Compass} label="User" value={user?.displayName ?? 'Signed out'} />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 bg-white/5 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex flex-wrap gap-2">
              <SwitchButton active={uiVersion === 'v1'} label="Classic Workspace" onClick={() => setUiVersion('v1')} />
              <SwitchButton active={uiVersion === 'v2'} label="Modern Workspace" onClick={() => setUiVersion('v2')} />
            </div>
            <button
              type="button"
              onClick={shell.handleClose}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-slate-200 transition hover:border-amber-300/60 hover:text-amber-200 lg:self-auto"
            >
              Close App
            </button>
          </div>
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-[28px] border border-slate-200/70 bg-white/85 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-3 rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_100%)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Command Deck</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Quick actions for daily library work. Only tasks available to your account are shown here.
              </p>
            </div>
            <V2ActionDeck {...shell.toolbarProps} />
          </aside>

          <main className="overflow-auto rounded-[30px] border border-slate-200/70 bg-white/70 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-4">
            {children}
          </main>
        </div>
      </div>

      <GlobalDialogs dialogs={shell.dialogs} actions={shell.actions} isPatrons={shell.isPatrons} />
    </div>
  );
};

const Metric = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers3;
  label: string;
  value: string;
}) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const SwitchButton = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition ${
      active
        ? 'bg-white text-slate-950 shadow-[0_10px_25px_rgba(255,255,255,0.16)]'
        : 'border border-white/20 bg-white/5 text-slate-300 hover:border-cyan-300/60 hover:text-white'
    }`}
  >
    {label}
  </button>
);

export default V2Layout;
