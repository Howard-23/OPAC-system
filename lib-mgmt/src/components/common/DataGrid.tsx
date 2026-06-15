import React from 'react';

interface Column {
  key: string;
  header: string;
  width?: string;
}

interface DataGridProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  onRowDoubleClick?: (row: any) => void;
  selectedId?: string | number;
  idField?: string;
}

export const DataGrid: React.FC<DataGridProps> = ({
  columns,
  data,
  onRowClick,
  onRowDoubleClick,
  selectedId,
  idField = 'id',
}) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-input shadow-bevel-sunken overflow-hidden">
      <div className="flex-1 overflow-auto">
        <table className="grid-table min-w-full table-fixed border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="grid-header select-none whitespace-nowrap"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, idx) => {
                const isSelected = selectedId !== undefined && row[idField] === selectedId;
                return (
                  <tr
                    key={row[idField] || idx}
                    onClick={() => onRowClick?.(row)}
                    onDoubleClick={() => onRowDoubleClick?.(row)}
                    className={`
                      cursor-default
                      ${isSelected ? 'bg-classic-blue dark:bg-dark-selection text-white' : 'hover:bg-blue-50 dark:hover:bg-dark-panel/50'}
                    `}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`grid-cell ${isSelected ? 'border-blue-400/30 dark:border-dark-accent/30' : ''}`}
                      >
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-gray-500 dark:text-dark-text-muted italic">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
