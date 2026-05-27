import React from 'react';
import { downloadCSV } from '../../utils/csvExport';
import { Button } from './Button';

/**
 * CSVDownloadButton — wraps the `downloadCSV` utility in a styled Button.
 *
 * Clicking the button serialises `data` to CSV and triggers a browser download
 * with the given `filename`.
 *
 * @param {{
 *   data: Object[],
 *   filename: string,
 *   label?: string,
 *   variant?: 'primary' | 'secondary' | 'ghost',
 *   disabled?: boolean,
 *   className?: string,
 * }} props
 */
export function CSVDownloadButton({
  data,
  filename,
  label = 'Download CSV',
  variant = 'secondary',
  disabled = false,
  className = '',
}) {
  const handleClick = () => {
    downloadCSV(data, filename);
  };

  const isEmpty = !Array.isArray(data) || data.length === 0;

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={disabled || isEmpty}
      className={className}
      aria-label={`Download ${filename} as CSV`}
      title={isEmpty ? 'No data to download' : `Download ${filename}`}
    >
      {/* Download icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
      {label}
    </Button>
  );
}

export default CSVDownloadButton;
