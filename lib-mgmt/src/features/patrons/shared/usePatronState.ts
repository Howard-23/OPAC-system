import React from 'react';
import { useNavigate } from 'react-router-dom';

import { usePatronStore } from '../../../stores/patronStore';

export const patronColumns = [
  { key: 'name', header: 'Name', width: '30%' },
  { key: 'idno', header: 'ID Number', width: '15%' },
  { key: 'group_name', header: 'Group', width: '15%' },
  { key: 'email', header: 'Email', width: '25%' },
  { key: 'unpaid_fine', header: 'Fines', width: '15%' },
];

export const usePatronState = () => {
  const navigate = useNavigate();
  const patrons = usePatronStore((state) => state.patrons);
  const selectedIdno = usePatronStore((state) => state.selectedIdno);
  const setSelectedIdno = usePatronStore((state) => state.setSelectedIdno);
  const fetchPatrons = usePatronStore((state) => state.fetchPatrons);

  React.useEffect(() => {
    void fetchPatrons();
  }, [fetchPatrons]);

  const handleSearch = (query: string, scope: string) => {
    console.log(`Searching for "${query}" in ${scope}`);
  };

  return {
    patrons,
    selectedIdno,
    setSelectedIdno,
    handleSearch,
    openPatron: (idno: string) => navigate(`/patrons/edit/${idno}`),
  };
};
