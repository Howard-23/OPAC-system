import React from 'react';
import { SearchBar } from '../../components/dashboard/SearchBar';
import { DataGrid } from '../../components/common/DataGrid';
import { usePatronStore } from '../../stores/patronStore';
import { useNavigate } from 'react-router-dom';

const COLUMNS = [
  { key: 'name', header: 'Name', width: '30%' },
  { key: 'idno', header: 'ID Number', width: '15%' },
  { key: 'group_name', header: 'Group', width: '15%' },
  { key: 'email', header: 'Email', width: '25%' },
  { key: 'unpaid_fine', header: 'Fines', width: '15%' },
];

export const PatronPage: React.FC = () => {
  const navigate = useNavigate();
  const { patrons, selectedIdno, setSelectedIdno, fetchPatrons } = usePatronStore();

  React.useEffect(() => {
    fetchPatrons();
  }, [fetchPatrons]);

  const handleSearch = (query: string, scope: string) => {
    console.log(`Searching for "${query}" in ${scope}`);
  };

  return (
    <div className="flex flex-col h-full">
      <SearchBar onSearch={handleSearch} />
      
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <DataGrid 
          columns={COLUMNS} 
          data={patrons} 
          selectedId={selectedIdno ?? undefined}
          onRowClick={(row) => setSelectedIdno(row.idno)}
          onRowDoubleClick={(row) => navigate(`/patrons/edit/${row.idno}`)}
          idField="idno"
        />
      </div>
      
      {/* Footer status bar for classic feel */}
      <div className="bg-[#D4D0C8] border-t border-white shadow-[0_-1px_0_#808080] px-2 py-0.5 text-[10px] text-gray-700 flex justify-between">
        <span>Patron Management</span>
        <span>Total Patrons: {patrons.length}</span>
      </div>
    </div>
  );
};
