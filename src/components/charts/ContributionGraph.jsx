/**
 * ContributionGraph — 12-week GitHub-style heatmap.
 *
 * Props:
 *   activityData: { [dateString: string]: number }  — count of work log entries per day
 *
 * Color intensity: 0=gray-100, 1=green-200, 2-3=green-400, 4+=green-600
 *
 * Requirements: 10.3
 */
import React from 'react';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function getColor(count) {
  if (!count || count === 0) return 'bg-gray-100 dark:bg-gray-700';
  if (count === 1) return 'bg-green-200';
  if (count <= 3) return 'bg-green-400';
  return 'bg-green-600';
}

function ContributionGraph({ activityData = {} }) {
  // Build 12 weeks of dates ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from 12 weeks ago, aligned to Sunday
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 83); // 12*7 - 1 = 83 days back
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // Build 12 columns (weeks), each with 7 rows (days)
  const weeks = [];
  for (let w = 0; w < 12; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const dateStr = date.toISOString().slice(0, 10);
      week.push({ dateStr, count: activityData[dateStr] ?? 0, date });
    }
    weeks.push(week);
  }

  // Week labels (month abbreviation at start of each month)
  const weekLabels = weeks.map((week) => {
    const firstDay = week[0].date;
    if (firstDay.getDate() <= 7) {
      return firstDay.toLocaleString('default', { month: 'short' });
    }
    return '';
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-1 mr-1">
          <div className="h-4" /> {/* spacer for month labels */}
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-3 text-xs text-textSecondary leading-3 w-6 text-right">
              {label}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {/* Month label */}
            <div className="h-4 text-xs text-textSecondary leading-4 w-3">
              {weekLabels[wi]}
            </div>
            {/* Day cells */}
            {week.map(({ dateStr, count, date }) => (
              <div
                key={dateStr}
                className={`h-3 w-3 rounded-sm ${getColor(count)}`}
                title={`${dateStr}: ${count} work log${count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 text-xs text-textSecondary">
        <span>Less</span>
        {['bg-gray-100 dark:bg-gray-700', 'bg-green-200', 'bg-green-400', 'bg-green-600'].map((cls, i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default ContributionGraph;
