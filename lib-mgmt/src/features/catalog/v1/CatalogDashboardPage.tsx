import React from 'react';

import { DataGrid } from '../../../components/common/DataGrid';
import { SearchBar } from '../../../components/dashboard/SearchBar';
import { RecordNavigator } from '../../../components/dashboard/RecordNavigator';
import { catalogColumns, useCatalogState } from '../shared/useCatalogState';

const CatalogDashboardPage: React.FC = () => {
  const { records, selectedId, setSelectedId, handleSearch, openSelectedRecord } = useCatalogState();

  return (
    <div className="flex flex-col h-full">
      <SearchBar onSearch={handleSearch} />

      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <DataGrid
          columns={catalogColumns}
          data={records}
          selectedId={selectedId}
          onRowClick={(row) => setSelectedId(row.id)}
          onRowDoubleClick={(row) => openSelectedRecord(row.controlno)}
          idField="id"
        />
      </div>

      <RecordNavigator />

      <div className="bg-classic-grey dark:bg-dark-surface border-t border-white dark:border-dark-highlight shadow-[0_-1px_0_#808080] dark:shadow-[0_-1px_0_#1A1A1A] px-2 py-0.5 text-[10px] text-gray-700 dark:text-dark-text-muted flex justify-between">
        <span>Ready</span>
        <span>Records: {records.length}</span>
      </div>
    </div>
  );
};

export default CatalogDashboardPage;
