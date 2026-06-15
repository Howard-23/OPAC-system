type ExcelCell = string | number | boolean | null | undefined;

interface ExcelSheet {
  name: string;
  columns: string[];
  rows: ExcelCell[][];
}

const escapeHtml = (value: ExcelCell) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const buildSheet = (sheet: ExcelSheet) => `
  <h2>${escapeHtml(sheet.name)}</h2>
  <table border="1">
    <thead>
      <tr>${sheet.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${sheet.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
        .join('')}
    </tbody>
  </table>
`;

export const downloadExcelWorkbook = (filename: string, sheets: ExcelSheet[]) => {
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        ${sheets.map(buildSheet).join('<br />')}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const excelDateTime = formatDateTime;
