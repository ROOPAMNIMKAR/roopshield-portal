/**
 * AttendanceCalendar — monthly calendar grid with color-coded attendance.
 *
 * Props:
 *   records: AttendanceRecord[]  — attendance records for the month
 *   month: number                — 0-indexed month (0=Jan, 11=Dec)
 *   year: number                 — full year e.g. 2025
 *
 * Color coding:
 *   Present=green, Absent=red, Late=amber, Half-Day=blue, Leave=gray, unmarked=white
 *
 * Requirements: 7.5, 15.1
 */
import React from 'react';

const STATUS_COLORS = {
  Present:    'bg-green-200 text-green-900',
  Absent:     'bg-red-200 text-red-900',
  Late:       'bg-amber-200 text-amber-900',
  'Half-Day': 'bg-blue-200 text-blue-900',
  Leave:      'bg-gray-200 text-gray-700',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function AttendanceCalendar({ records = [], month, year }) {
  // Build a map of date string → status
  const statusMap = {};
  for (const r of records) {
    statusMap[r.date] = r.status;
  }

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = firstDay.getDay(); // 0=Sun

  // Build grid cells: leading empty + day cells
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthName = firstDay.toLocaleString('default', { month: 'long' });

  return (
    <div className="select-none">
      <p className="text-sm font-semibold text-textPrimary mb-2 text-center">
        {monthName} {year}
      </p>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-textSecondary py-1">
            {d}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const status = statusMap[dateStr];
          const colorClass = status ? STATUS_COLORS[status] : 'bg-white border border-border text-textSecondary';
          return (
            <div
              key={dateStr}
              className={`rounded text-center text-xs py-1.5 font-medium ${colorClass}`}
              title={status ?? 'Unmarked'}
            >
              {day}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-3">
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <span key={status} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${cls}`}>
            {status}
          </span>
        ))}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-white border border-border text-textSecondary">
          Unmarked
        </span>
      </div>
    </div>
  );
}

export default AttendanceCalendar;
