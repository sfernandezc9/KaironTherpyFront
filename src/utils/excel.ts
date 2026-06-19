// Export tabular data to an Excel-readable .xls file (HTML table format).
// No external dependency: Excel opens an HTML table served with the
// ms-excel mime type and an .xls extension.

export interface ExcelColumn<T> {
  header: string;
  accessor: (row: T) => string | number | null | undefined;
}

const escapeHtml = (v: string | number | null | undefined): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export function exportToExcel<T>(
  filename: string,
  columns: ExcelColumn<T>[],
  rows: T[],
): void {
  const thead = `<tr>${columns.map((c) => `<th>${escapeHtml(c.header)}</th>`).join('')}</tr>`;
  const tbody = rows
    .map((row) => `<tr>${columns.map((c) => `<td>${escapeHtml(c.accessor(row))}</td>`).join('')}</tr>`)
    .join('');

  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="UTF-8"></head>` +
    `<body><table border="1">${thead}${tbody}</table></body></html>`;

  // BOM so Excel reads UTF-8 correctly
  const blob = new Blob(['﻿', html], { type: 'application/vnd.ms-excel;charset=UTF-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
