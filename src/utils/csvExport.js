/**
 * Serialises an array of objects to a CSV string and triggers a browser download.
 *
 * - The first row is a header row derived from the keys of the first object.
 * - Cell values are escaped: any value containing a comma, double-quote, or
 *   newline is wrapped in double-quotes; existing double-quotes are doubled.
 * - If `data` is empty or not an array, no download is triggered.
 *
 * @param {Object[]} data     Array of plain objects to serialise
 * @param {string}   filename Desired filename for the downloaded file (e.g. "report.csv")
 */
export function downloadCSV(data, filename) {
  if (!Array.isArray(data) || data.length === 0) return;

  const headers = Object.keys(data[0]);

  const escapeCell = (value) => {
    const str = value === null || value === undefined ? '' : String(value);
    // Wrap in quotes if the value contains a comma, double-quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [
    headers.map(escapeCell).join(','),
    ...data.map((row) => headers.map((header) => escapeCell(row[header])).join(',')),
  ];

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the object URL after the download is triggered
  URL.revokeObjectURL(url);
}
