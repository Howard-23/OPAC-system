import React from 'react';

import { useCatalogStore } from '../../../stores/catalogStore';

export const catalogColumns = [
  { key: 'title', header: 'Title', width: '45%' },
  { key: 'author', header: 'Author', width: '30%' },
  { key: 'callno', header: 'Call Number', width: '15%' },
  { key: 'year', header: 'Year', width: '10%' },
];

export const useCatalogState = () => {
  const records = useCatalogStore((state) => state.records);
  const selectedId = useCatalogStore((state) => state.selectedId);
  const setSelectedId = useCatalogStore((state) => state.setSelectedId);
  const fetchRecords = useCatalogStore((state) => state.fetchRecords);
  const fetchCount = useCatalogStore((state) => state.fetchCount);
  const searchSemantic = useCatalogStore((state) => state.searchSemantic);
  const setEditDialogOpen = useCatalogStore((state) => state.setEditDialogOpen);
  const setEditingControlNo = useCatalogStore((state) => state.setEditingControlNo);

  React.useEffect(() => {
    void fetchRecords();
    void fetchCount();
  }, [fetchCount, fetchRecords]);

  const openSelectedRecord = (controlno?: string) => {
    if (!controlno) {
      return;
    }

    setEditingControlNo(controlno);
    setEditDialogOpen(true);
  };

  const handleSearch = (query: string, _scope: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      void fetchRecords(1);
      return;
    }

    void searchSemantic(trimmed);
  };

  return {
    records,
    selectedId,
    setSelectedId,
    handleSearch,
    openSelectedRecord,
  };
};
