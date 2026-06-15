import React from 'react';

import { CreditCard, ShieldCheck, Users } from 'lucide-react';

import { usePatronState } from '../shared/usePatronState';

const PatronDirectoryPage: React.FC = () => {
  const { patrons, selectedIdno, setSelectedIdno, handleSearch, openPatron } = usePatronState();
  const totalFines = patrons.reduce((sum, patron) => sum + patron.unpaid_fine, 0);

  return (
    <div className="min-h-full rounded-[28px] bg-white/92 shadow-[0_28px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 backdrop-blur">
      <div className="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_42%),linear-gradient(135deg,#fbf7ef_0%,#f7fbff_100%)] px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">Patron Ops</p>
            <h1 className="mt-2 font-['Trebuchet_MS','Segoe_UI',sans-serif] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Access, fines, and reader records
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Responsive patron directory for the modern shell. Same stores. Different surface.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard icon={Users} label="Patrons" value={patrons.length.toString()} />
            <StatCard icon={CreditCard} label="Outstanding" value={totalFines.toString()} />
            <StatCard icon={ShieldCheck} label="Selection" value={selectedIdno ?? 'None'} />
          </div>
        </div>

        <form
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            handleSearch(String(formData.get('query') ?? ''), String(formData.get('scope') ?? 'Keyword'));
          }}
        >
          <input
            name="query"
            type="text"
            placeholder="Search patron name, ID, email, or group"
            className="h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
          />
          <select
            name="scope"
            defaultValue="Keyword"
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white sm:w-44"
          >
            <option value="Keyword">Keyword</option>
            <option value="Name">Name</option>
            <option value="ID Number">ID Number</option>
            <option value="Email">Email</option>
          </select>
          <button
            type="submit"
            className="h-12 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Search Patrons
          </button>
        </form>
      </div>

      <div className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-2">
        {patrons.length > 0 ? (
          patrons.map((patron) => {
            const selected = patron.idno === selectedIdno;
            return (
              <button
                key={patron.idno}
                type="button"
                className={`rounded-3xl border p-5 text-left shadow-sm transition ${
                  selected
                    ? 'border-sky-500 bg-sky-50 shadow-[0_16px_36px_rgba(14,165,233,0.18)]'
                    : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]'
                }`}
                onClick={() => setSelectedIdno(patron.idno)}
                onDoubleClick={() => openPatron(patron.idno)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{patron.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{patron.idno}</p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                    {patron.group_name || 'Patron'}
                  </span>
                </div>

                <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Email</dt>
                    <dd className="mt-1 break-all text-slate-700">{patron.email || 'None'}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Department</dt>
                    <dd className="mt-1 text-slate-700">{patron.dept || 'None'}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Phone</dt>
                    <dd className="mt-1 text-slate-700">{patron.phone || 'None'}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Outstanding Fine</dt>
                    <dd className="mt-1 font-semibold text-amber-700">{patron.unpaid_fine}</dd>
                  </div>
                </dl>
              </button>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-sm text-slate-500">
            No patrons available.
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
        <p className="text-lg font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

export default PatronDirectoryPage;
