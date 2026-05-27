/**
 * StatusBadge — colored pill for intern or task status values.
 *
 * Supported statuses:
 *   Intern:     Active=green, Inactive=gray, Completed=blue
 *   Task:       To Do=gray, In Progress=blue, Under Review=amber, Completed=green
 *   Attendance: Present=green, Absent=red, Late=amber, Half-Day=blue, Leave=gray
 */

const STATUS_STYLES = {
  // Intern statuses
  Active:         'bg-green-100 text-green-800 border border-green-200',
  Inactive:       'bg-gray-100 text-gray-600 border border-gray-200',
  // Task statuses
  'To Do':        'bg-gray-100 text-gray-600 border border-gray-200',
  'In Progress':  'bg-blue-100 text-blue-800 border border-blue-200',
  'Under Review': 'bg-amber-100 text-amber-800 border border-amber-200',
  Completed:      'bg-green-100 text-green-800 border border-green-200',
  // Attendance statuses
  Present:        'bg-green-100 text-green-800 border border-green-200',
  Absent:         'bg-red-100 text-red-700 border border-red-200',
  Late:           'bg-amber-100 text-amber-800 border border-amber-200',
  'Half-Day':     'bg-blue-100 text-blue-800 border border-blue-200',
  Leave:          'bg-gray-100 text-gray-500 border border-gray-200',
};

const DEFAULT_STYLE = 'bg-gray-100 text-gray-600 border border-gray-200';

/**
 * @param {{ status: string, className?: string }} props
 */
export function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] ?? DEFAULT_STYLE;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
