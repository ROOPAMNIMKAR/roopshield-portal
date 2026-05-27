/**
 * AttendanceModule — Admin attendance page with three sub-tabs.
 *
 * Tabs:
 *   1. Mark Attendance — date picker + intern table + status selectors
 *   2. View Records    — filter + table + CSV export
 *   3. Reports         — per-intern summary + calendar view
 *
 * Requirements: 6.1–6.6, 7.1–7.5
 */
import React, { useEffect, useState, useMemo } from 'react';
import useAttendanceStore from '../../store/attendanceStore';
import useInternStore from '../../store/internStore';
import { useToast } from '../../hooks/useToast';
import { Button, StatusBadge, CSVDownloadButton } from '../../components/common';
import AttendanceCalendar from '../../components/charts/AttendanceCalendar';
import { formatDate } from '../../utils/dateUtils';
import { generateId } from '../../utils/uuid';
import useAuthStore from '../../store/authStore';

const STATUSES = ['Present', 'Absent', 'Late', 'Half-Day', 'Leave'];
const TABS = ['Mark Attendance', 'View Records', 'Reports'];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function AttendanceModule() {
  const [activeTab, setActiveTab] = useState(0);
  const { records, loadAttendance, markAttendance, getFilteredRecords, getReportSummary } =
    useAttendanceStore();
  const { interns, loadInterns } = useInternStore();
  const { showToast } = useToast();
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    loadAttendance();
    loadInterns();
  }, []);

  const activeInterns = useMemo(() => interns.filter((i) => i.status === 'Active'), [interns]);

  return (
    <section aria-label="Attendance Module">
      <h1 className="text-2xl font-bold text-textPrimary mb-5">Attendance</h1>

      {/* Tab bar */}
      <div className="flex border-b border-border mb-6" role="tablist">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === idx}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent -mb-px ${
              activeTab === idx
                ? 'border-accent text-accent'
                : 'border-transparent text-textSecondary hover:text-textPrimary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <MarkAttendanceTab
          activeInterns={activeInterns}
          markAttendance={markAttendance}
          showToast={showToast}
          currentUser={currentUser}
          records={records}
        />
      )}
      {activeTab === 1 && (
        <ViewRecordsTab
          interns={interns}
          getFilteredRecords={getFilteredRecords}
          records={records}
        />
      )}
      {activeTab === 2 && (
        <ReportsTab
          interns={interns}
          getReportSummary={getReportSummary}
          records={records}
        />
      )}
    </section>
  );
}

/* ─── Tab 1: Mark Attendance ─────────────────────────────────────────────── */
function MarkAttendanceTab({ activeInterns, markAttendance, showToast, currentUser, records }) {
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState({});
  const [confirmAllPresent, setConfirmAllPresent] = useState(false);

  // Initialize rows when date or interns change
  useEffect(() => {
    const init = {};
    activeInterns.forEach((intern) => {
      const existing = records.find(
        (r) => r.internId === intern.id && r.date === date
      );
      init[intern.id] = {
        status: existing?.status ?? 'Present',
        notes: existing?.notes ?? '',
      };
    });
    setRows(init);
  }, [date, activeInterns, records]);

  function handleMarkAllPresent() {
    setRows((prev) => {
      const updated = { ...prev };
      activeInterns.forEach((intern) => {
        updated[intern.id] = { ...(updated[intern.id] || {}), status: 'Present' };
      });
      return updated;
    });
    // Submit immediately
    const now = new Date().toISOString();
    const todayDate = today();
    const newRecords = activeInterns.map((intern) => ({
      id: generateId(),
      internId: intern.id,
      internName: intern.name,
      date: todayDate,
      status: 'Present',
      notes: '',
      markedBy: currentUser?.name ?? 'Admin',
      markedAt: now,
    }));
    markAttendance(newRecords);
    showToast(`All ${activeInterns.length} interns marked Present for today.`, 'success');
    setConfirmAllPresent(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const now = new Date().toISOString();
    const newRecords = activeInterns.map((intern) => ({
      id: generateId(),
      internId: intern.id,
      internName: intern.name,
      date,
      status: rows[intern.id]?.status ?? 'Present',
      notes: rows[intern.id]?.notes ?? '',
      markedBy: currentUser?.name ?? 'Admin',
      markedAt: now,
    }));
    markAttendance(newRecords);
    showToast(`Attendance marked for ${date}.`, 'success');
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center gap-4 mb-5">
        <div className="flex items-center gap-3">
          <label htmlFor="att-date" className="text-sm font-medium text-textSecondary">Date</label>
          <input
            id="att-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setConfirmAllPresent(true)}
          disabled={activeInterns.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 text-sm"
        >
          ✅ Mark All Present Today
        </Button>
      </div>

      {/* Confirm dialog for Mark All Present */}
      {confirmAllPresent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-semibold text-textPrimary mb-2">Mark All Present Today?</h3>
            <p className="text-sm text-textSecondary mb-5">
              This will mark all {activeInterns.length} active intern{activeInterns.length !== 1 ? 's' : ''} as <strong>Present</strong> for today ({today()}). Existing records for today will be overwritten.
            </p>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setConfirmAllPresent(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleMarkAllPresent}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                Yes, Mark All Present
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeInterns.length === 0 ? (
        <p className="text-textSecondary text-sm">No active interns found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Intern</th>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Status</th>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeInterns.map((intern) => (
                <tr key={intern.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-textPrimary">{intern.name}</td>
                  <td className="px-4 py-3">
                    <select
                      value={rows[intern.id]?.status ?? 'Present'}
                      onChange={(e) =>
                        setRows((prev) => ({
                          ...prev,
                          [intern.id]: { ...prev[intern.id], status: e.target.value },
                        }))
                      }
                      className="border border-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      aria-label={`Attendance status for ${intern.name}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={rows[intern.id]?.notes ?? ''}
                      onChange={(e) =>
                        setRows((prev) => ({
                          ...prev,
                          [intern.id]: { ...prev[intern.id], notes: e.target.value },
                        }))
                      }
                      placeholder="Optional notes…"
                      className="w-full border border-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      aria-label={`Notes for ${intern.name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <Button type="submit" disabled={activeInterns.length === 0}>
          Save Attendance
        </Button>
      </div>
    </form>
  );
}

/* ─── Tab 2: View Records ────────────────────────────────────────────────── */
function ViewRecordsTab({ interns, getFilteredRecords, records }) {
  const [filterInternId, setFilterInternId] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = useMemo(
    () =>
      getFilteredRecords({
        internId: filterInternId || undefined,
        dateStart: filterStart || undefined,
        dateEnd: filterEnd || undefined,
        status: filterStatus || undefined,
      }),
    [records, filterInternId, filterStart, filterEnd, filterStatus]
  );

  const csvFilename = `attendance_records_${today()}.csv`;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 p-4 bg-white rounded-xl border border-border">
        <select
          value={filterInternId}
          onChange={(e) => setFilterInternId(e.target.value)}
          className="text-sm border border-border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Filter by intern"
        >
          <option value="">All Interns</option>
          {interns.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <input
          type="date"
          value={filterStart}
          onChange={(e) => setFilterStart(e.target.value)}
          className="text-sm border border-border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Start date filter"
        />
        <input
          type="date"
          value={filterEnd}
          onChange={(e) => setFilterEnd(e.target.value)}
          className="text-sm border border-border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="End date filter"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <CSVDownloadButton data={filtered} filename={csvFilename} label="Export CSV" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-textSecondary">Intern</th>
              <th className="text-left px-4 py-3 font-medium text-textSecondary">Date</th>
              <th className="text-left px-4 py-3 font-medium text-textSecondary">Status</th>
              <th className="text-left px-4 py-3 font-medium text-textSecondary">Notes</th>
              <th className="text-left px-4 py-3 font-medium text-textSecondary">Marked By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-textSecondary">
                  No records found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-textPrimary">{r.internName}</td>
                  <td className="px-4 py-3 text-textSecondary">{r.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-textSecondary">{r.notes || '—'}</td>
                  <td className="px-4 py-3 text-textSecondary">{r.markedBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Tab 3: Reports ─────────────────────────────────────────────────────── */
function ReportsTab({ interns, getReportSummary, records }) {
  const [selectedInternId, setSelectedInternId] = useState('');
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const summary = useMemo(() => getReportSummary(), [records]);

  const calRecords = useMemo(() => {
    if (!selectedInternId) return [];
    return records.filter(
      (r) =>
        r.internId === selectedInternId &&
        new Date(r.date).getMonth() === calMonth &&
        new Date(r.date).getFullYear() === calYear
    );
  }, [records, selectedInternId, calMonth, calYear]);

  function pctColor(pct) {
    if (pct >= 80) return 'text-green-700 bg-green-50';
    if (pct >= 60) return 'text-amber-700 bg-amber-50';
    return 'text-danger bg-red-50';
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }

  return (
    <div>
      {/* Summary table */}
      <div className="overflow-x-auto rounded-xl border border-border mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Intern', 'Total', 'Present', 'Absent', 'Late', 'Half-Day', 'Leave', 'Attendance %'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-textSecondary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {summary.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-textSecondary">No data.</td>
              </tr>
            ) : (
              summary.map((row) => (
                <tr key={row.internId} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-textPrimary">{row.internName}</td>
                  <td className="px-4 py-3">{row.total}</td>
                  <td className="px-4 py-3">{row.present}</td>
                  <td className="px-4 py-3">{row.absent}</td>
                  <td className="px-4 py-3">{row.late}</td>
                  <td className="px-4 py-3">{row.halfDay}</td>
                  <td className="px-4 py-3">{row.leave}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pctColor(row.percentage)}`}>
                      {row.percentage}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Calendar view */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h2 className="text-base font-semibold text-textPrimary mb-4">Monthly Calendar View</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={selectedInternId}
            onChange={(e) => setSelectedInternId(e.target.value)}
            className="text-sm border border-border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Select intern for calendar"
          >
            <option value="">Select intern…</option>
            {interns.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={prevMonth} aria-label="Previous month" className="px-2 py-1">‹</Button>
            <span className="text-sm font-medium text-textPrimary min-w-[120px] text-center">
              {new Date(calYear, calMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="ghost" onClick={nextMonth} aria-label="Next month" className="px-2 py-1">›</Button>
          </div>
        </div>
        {selectedInternId ? (
          <AttendanceCalendar records={calRecords} month={calMonth} year={calYear} />
        ) : (
          <p className="text-textSecondary text-sm">Select an intern to view their calendar.</p>
        )}
      </div>
    </div>
  );
}

export default AttendanceModule;
