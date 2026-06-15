import React, { useState, useEffect } from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { DataGrid } from '../common/DataGrid';
import { invoke } from '../../lib/runtimeBridge';

interface ReservationDialogProps {
  onClose: () => void;
}

interface Reservation {
  rec_number: number;
  idno: string;
  accession: string;
  date_reserve: string;
  reserve_until: string;
  is_served: string;
  patron_name: string | null;
  item_title: string | null;
}

const COLUMNS = [
  { key: 'idno',        header: 'Patron ID',   width: '16%' },
  { key: 'patron_name', header: 'Patron Name',  width: '26%' },
  { key: 'accession',   header: 'Accession',   width: '16%' },
  { key: 'item_title',  header: 'Control No',  width: '18%' },
  { key: 'date_reserve',header: 'Reserved On', width: '24%' },
];

export const ReservationDialog: React.FC<ReservationDialogProps> = ({ onClose }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedRec, setSelectedRec] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // New reservation form
  const [newIdno, setNewIdno] = useState('');
  const [newAccession, setNewAccession] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await invoke<Reservation[]>('get_reservations');
      setReservations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const gridData = reservations.map(r => ({
    id: r.rec_number,
    idno: r.idno,
    patron_name: r.patron_name ?? '—',
    accession: r.accession,
    item_title: r.item_title ?? '—',
    date_reserve: new Date(r.date_reserve).toLocaleDateString(),
  }));

  const handleAdd = async () => {
    setError('');
    if (!newIdno.trim() || !newAccession.trim()) {
      setError('Patron ID and Accession are required.');
      return;
    }
    setAdding(true);
    try {
      await invoke('add_reservation', { idno: newIdno.trim(), accession: newAccession.trim() });
      setNewIdno('');
      setNewAccession('');
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAdding(false);
    }
  };

  const handleServe = async () => {
    if (!selectedRec) return;
    if (!confirm('Mark this reservation as served?')) return;
    try {
      await invoke('serve_reservation', { recNumber: selectedRec });
      setSelectedRec(undefined);
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async () => {
    if (!selectedRec) return;
    if (!confirm('Cancel this reservation?')) return;
    try {
      await invoke('cancel_reservation', { recNumber: selectedRec });
      setSelectedRec(undefined);
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <BeveledBox variant="raised" className="w-full max-w-3xl bg-classic-grey dark:bg-dark-surface shadow-2xl flex flex-col">
        {/* Title Bar */}
        <div className="bg-classic-blue-gradient px-2 py-1 flex items-center justify-between text-white font-bold text-sm">
          <span>Item Reservations</span>
          <button onClick={onClose} className="hover:bg-red-500 px-1">✕</button>
        </div>

        <div className="p-4 flex flex-col gap-3 min-h-[500px]">
          {/* Active Reservations List */}
          <div>
            <p className="text-xs font-bold text-gray-700 dark:text-dark-text mb-1">Active Reservations (IsServed = N)</p>
            <div className="h-[220px] overflow-hidden">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center border-2 border-gray-400 dark:border-dark-border-dark border-t-gray-600 dark:border-t-dark-shadow border-l-gray-600 dark:border-l-dark-shadow bg-white dark:bg-dark-input text-xs text-gray-500 dark:text-dark-text-muted">
                  Loading...
                </div>
              ) : (
                <DataGrid
                  columns={COLUMNS}
                  data={gridData}
                  selectedId={selectedRec}
                  onRowClick={(row) => setSelectedRec(row.id)}
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button onClick={handleServe} disabled={!selectedRec} className="btn-classic px-5 h-8 font-bold text-sm disabled:opacity-50">
              ✔ Mark Served
            </button>
            <button onClick={handleCancel} disabled={!selectedRec} className="btn-classic px-5 h-8 text-red-700 text-sm disabled:opacity-50">
              ✕ Cancel
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-400 mt-1" />

          {/* Add New Reservation Form */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-700 dark:text-dark-text uppercase tracking-wide">New Reservation</p>
            <div className="flex gap-2">
              <div className="flex flex-col flex-1">
                <label className="text-[10px] text-gray-600 dark:text-dark-text-muted font-bold mb-0.5">Patron ID</label>
                <input
                  id="res-idno"
                  type="text"
                  value={newIdno}
                  onChange={e => setNewIdno(e.target.value)}
                  className="input-classic h-7 text-xs"
                  placeholder="e.g. 2024-0001"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-[10px] text-gray-600 dark:text-dark-text-muted font-bold mb-0.5">Accession No.</label>
                <input
                  id="res-accession"
                  type="text"
                  value={newAccession}
                  onChange={e => setNewAccession(e.target.value)}
                  className="input-classic h-7 text-xs"
                  placeholder="e.g. ACC-00123"
                />
              </div>
              <div className="flex flex-col justify-end">
                <button
                  id="res-submit"
                  onClick={handleAdd}
                  disabled={adding}
                  className="btn-classic px-5 h-7 text-xs font-bold disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Reserve'}
                </button>
              </div>
            </div>
            {error && <p className="text-red-600 text-[10px] font-bold">{error}</p>}
            <p className="text-[10px] text-gray-500 dark:text-dark-text-muted italic">
              Reservation auto-expires in 7 days. Status set to "Served" when item is issued.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-1">
            <button onClick={onClose} className="btn-classic px-8 h-8 text-sm">Close</button>
          </div>
        </div>
      </BeveledBox>
    </div>
  );
};
