/**
 * InternAttendance — Intern attendance page.
 *
 * Features:
 * - Self-mark attendance for today (Present / Late / Half-Day / Leave)
 * - Monthly calendar grid
 * - Summary statistics
 * - Previous/next month navigation
 */
import React, { useEffect, useMemo, useState } from 'react';
import useAuthStore from '../../store/authStore';
import useAttendanceStore from '../../store/attendanceStore';
import { Button, StatusBadge } from '../../components/common';
import AttendanceCalendar from '../../components/charts/AttendanceCalendar';
import { useToast } from '../../hooks/useToast';
import { generateId } from '../../utils/uuid';

const SELF_STATUSES = ['Present', 'Late', 'Half-Day', 'Leave'];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function InternAttendance() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { records, loadAttendance, markAttendance } = useAttendanceStore();
  const { showToast } = useToast();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selfStatus, setSelfStatus] = useState('Present');
  const [selfNotes, setSelfNotes] = useState('');

  useEffect(() => { loadAttendance(); }, []);

  const internId = currentUser?.id;
  const internName = currentUser?.name ?? '';

  const myRecords = useMemo(
    () => records.filter((r) => r.internId === internId),
    [records, internId]
  );

  const monthRecords = useMemo(
    () => myRecords.filter((r) => {
      const d = new Date(r.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }),
    [myRecords, month, year]
  );

  // Today's existing record
  const todayRecord = useMemo(
    () => myRecords.find((r) => r.date === todayStr()),
    [myRecords]
  );

  // Summary stats (all-time)
  const total   = myRecords.length;
  const present = myRecords.filter((r) => r.status === 'Present').length;
  const absent  = myRecords.filter((r) => r.status === 'Absent').length;
  const late    = myRecords.filter((r) => r.status === 'Late').length;
  const halfDay = myRecords.filter((r) => r.status === 'Half-Day').length;
  const leave   = myRecords.filter((r) => r.status === 'Leave').length;
  const attPct  = total > 0 ? Math.round((present / total) * 100) : 0;

  function handleMarkToday(e) {
    e.preventDefault();
    markAttendance([{
      id: generateId(),
      internId,
      internName,
      date: todayStr(),
      status: selfStatus,
      notes: selfNotes.trim(),
      markedBy: internName,
      markedAt: new Date().toISOString(),
    }]);
    showToast(`Attendance marked as ${selfStatus} for today.`, 'success');
    setSelfNotes('');
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const monthLabel = new Date(year, month).toLocaleString('default', {
    month: 'long', year: 'numeric',
  });

  return (
    <section aria-label="My Attendance">
      <h1 className="text-2xl font-bold text-textPrimary mb-6">My Attendance</h1>

      {/* ── Self-mark today ── */}
      <div className="bg-white rounded-xl border border-border p-5 mb-6">
        <h2 className="text-base font-semibold text-textPrimary mb-1">Mark Today's Attendance</h2>
        <p className="text-xs text-textSecondary mb-4">{todayStr()}</p>

        {todayRecord ? (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-textSecondary">Already marked:</span>
            <StatusBadge status={todayRecord.status} />
            <span className="text-xs text-textSecondary">by {todayRecord.markedBy}</span>
            <span className="text-xs text-textSecondary italic">(You can update it below)</span>
          </div>
        ) : (
          <p className="text-sm text-amber-600 font-medium mb-2">⚠ Not marked yet for today</p>
        )}

        <form onSubmit={handleMarkToday} className="flex flex-wrap items-end gap-3 mt-4">
          <div>
            <label htmlFor="self-status" className="block text-xs font-medium text-textSecondary mb-1">
              Status
            </label>
            <select
              id="self-status"
              value={selfStatus}
              onChange={(e) => setSelfStatus(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {SELF_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="self-notes" className="block text-xs font-medium text-textSecondary mb-1">
              Notes (optional)
            </label>
            <input
              id="self-notes"
              type="text"
              value={selfNotes}
              onChange={(e) => setSelfNotes(e.target.value)}
              placeholder="e.g. Working from home"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <Button type="submit">
            {todayRecord ? 'Update Attendance' : 'Mark Attendance'}
          </Button>
        </form>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {[
          { label: 'Total',        value: total,          color: 'text-textPrimary' },
          { label: 'Present',      value: present,        color: 'text-green-600' },
          { label: 'Absent',       value: absent,         color: 'text-danger' },
          { label: 'Late',         value: late,           color: 'text-amber-600' },
          { label: 'Half-Day',     value: halfDay,        color: 'text-blue-600' },
          { label: 'Leave',        value: leave,          color: 'text-gray-500' },
          { label: 'Attendance %', value: `${attPct}%`,   color: attPct >= 80 ? 'text-green-600' : attPct >= 60 ? 'text-amber-600' : 'text-danger' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-3 text-center">
            <p className="text-xs text-textSecondary mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Calendar ── */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-5">
          <Button variant="ghost" onClick={prevMonth} aria-label="Previous month" className="px-3 py-1.5">‹ Prev</Button>
          <h2 className="text-base font-semibold text-textPrimary">{monthLabel}</h2>
          <Button variant="ghost" onClick={nextMonth} aria-label="Next month" className="px-3 py-1.5">Next ›</Button>
        </div>
        <AttendanceCalendar records={monthRecords} month={month} year={year} />
      </div>
    </section>
  );
}

export default InternAttendance;
