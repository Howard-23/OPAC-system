import React from 'react';

import { BookOpen, FileDigit, LibraryBig } from 'lucide-react';

import { catalogColumns, useCatalogState } from '../shared/useCatalogState';

const CatalogDashboardPage: React.FC = () => {
  const { records, selectedId, setSelectedId, handleSearch, openSelectedRecord } = useCatalogState();

  return (
    <div className="min-h-full rounded-[28px] bg-white/90 shadow-[0_28px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 backdrop-blur">
      <div className="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.14),_transparent_48%),linear-gradient(135deg,#fffef7_0%,#f8fbff_100%)] px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700">Catalog Hub</p>
            <h1 className="mt-2 font-['Trebuchet_MS','Segoe_UI',sans-serif] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Modern catalog control
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Same invoke layer. New shell. Records stay headless; only the render tree changes.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard icon={LibraryBig} label="Records" value={records.length.toString()} />
            <StatCard icon={BookOpen} label="Mode" value="Modern" />
            <StatCard icon={FileDigit} label="Selection" value={selectedId ? `#${selectedId}` : 'None'} />
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
            placeholder="Search by title, author, call number, or keyword"
            className="h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white"
          />
          <select
            name="scope"
            defaultValue="Keyword"
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white sm:w-44"
          >
            {catalogColumns.map((column) => (
              <option key={column.key} value={column.header}>
                {column.header}
              </option>
            ))}
            <option value="Keyword">Keyword</option>
          </select>
          <button
            type="submit"
            className="h-12 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            Search Catalog
          </button>
        </form>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-slate-100 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
          <div className="hidden grid-cols-[1.8fr_1.2fr_0.9fr_0.6fr] gap-4 border-b border-slate-800 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 md:grid">
            <span>Title</span>
            <span>Author</span>
            <span>Call Number</span>
            <span>Year</span>
          </div>

          <div className="divide-y divide-slate-800">
            {records.length > 0 ? (
              records.map((record) => {
                const selected = record.id === selectedId;
                return (
                  <button
                    key={record.id}
                    type="button"
                    className={`grid w-full gap-3 px-5 py-4 text-left transition md:grid-cols-[1.8fr_1.2fr_0.9fr_0.6fr] ${
                      selected ? 'bg-cyan-600/20' : 'hover:bg-slate-900'
                    }`}
                    onClick={() => setSelectedId(record.id)}
                    onDoubleClick={() => openSelectedRecord(record.controlno)}
                  >
                    <span className="block font-semibold text-white">{record.title}</span>
                    <span className="block text-sm text-slate-300">{record.author}</span>
                    <span className="block text-sm text-cyan-200">{record.callno}</span>
                    <span className="block text-sm text-slate-400">{record.year}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-5 py-8 text-sm text-slate-400">No catalog records available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
        <p className="text-lg font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

export default CatalogDashboardPage;
