import React from 'react';

import { DataGrid } from '../../../components/common/DataGrid';
import { SearchBar } from '../../../components/dashboard/SearchBar';
import { patronColumns, usePatronState } from '../shared/usePatronState';

const PatronDirectoryPage: React.FC = () => {
  const { patrons, selectedIdno, setSelectedIdno, handleSearch, openPatron } = usePatronState();

  return (
    <div className="flex flex-col h-full">
      <SearchBar onSearch={handleSearch} />

      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <DataGrid
          columns={patronColumns}
          data={patrons}
          selectedId={selectedIdno ?? undefined}
          onRowClick={(row) => setSelectedIdno(row.idno)}
          onRowDoubleClick={(row) => openPatron(row.idno)}
          idField="idno"
        />
      </div>

      <div className="bg-[#D4D0C8] border-t border-white shadow-[0_-1px_0_#808080] px-2 py-0.5 text-[10px] text-gray-700 flex justify-between dark:bg-dark-surface dark:border-dark-highlight dark:text-dark-text-muted dark:shadow-[0_-1px_0_#1A1A1A]">
        <span>Patron Management</span>
        <span>Total Patrons: {patrons.length}</span>
      </div>
    </div>
  );
};

export default PatronDirectoryPage;
