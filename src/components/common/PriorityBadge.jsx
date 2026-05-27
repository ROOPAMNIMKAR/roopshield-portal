/**
 * PriorityBadge — color-coded task priority label.
 *
 * Supported priorities: Low=green, Medium=blue, High=amber, Critical=red
 */

const PRIORITY_STYLES = {
  Low:      'bg-green-100 text-green-800 border border-green-200',
  Medium:   'bg-blue-100 text-blue-800 border border-blue-200',
  High:     'bg-amber-100 text-amber-800 border border-amber-200',
  Critical: 'bg-red-100 text-red-700 border border-red-200 font-semibold',
};

const DEFAULT_STYLE = 'bg-gray-100 text-gray-600 border border-gray-200';

/**
 * @param {{ priority: string, className?: string }} props
 */
export function PriorityBadge({ priority, className = '' }) {
  const style = PRIORITY_STYLES[priority] ?? DEFAULT_STYLE;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}
      aria-label={`Priority: ${priority}`}
    >
      {priority}
    </span>
  );
}

export default PriorityBadge;
