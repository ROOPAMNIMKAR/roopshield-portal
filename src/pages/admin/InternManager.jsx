/**
 * InternManager — Admin page for managing intern profiles.
 *
 * Features:
 * - Three-column responsive card grid
 * - Add/Edit intern via InternForm in Modal
 * - Delete with ConfirmDialog (cascade)
 * - Click card → Intern Profile Modal
 * - Real-time debounced search (name, department, status)
 * - Bulk selection + bulk status change
 * - Empty state when no results
 *
 * Requirements: 5.1–5.11
 */
import React, { useEffect, useState, useMemo } from 'react';
import useInternStore from '../../store/internStore';
import useAttendanceStore from '../../store/attendanceStore';
import useTaskStore from '../../store/taskStore';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../hooks/useToast';
import {
  Avatar, Button, StatusBadge, Modal, ConfirmDialog,
} from '../../components/common';
import InternForm from '../../components/InternForm';
import { formatDate, daysBetween } from '../../utils/dateUtils';

const BULK_STATUSES = ['Active', 'Inactive', 'Completed'];

function InternManager() {
  const { interns, loadInterns, addIntern, updateIntern, deleteIntern, bulkUpdateStatus } =
    useInternStore();
  const { records, loadAttendance } = useAttendanceStore();
  const { tasks, loadTasks } = useTaskStore();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [addOpen, setAddOpen] = useState(false);
  const [editIntern, setEditIntern] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [profileIntern, setProfileIntern] = useState(null);

  const [selected, setSelected] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [newCredentials, setNewCredentials] = useState(null);

  useEffect(() => {
    loadInterns();
    loadAttendance();
    loadTasks();
  }, []);

  // Filtered interns
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return interns;
    return interns.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.department?.toLowerCase().includes(q) ||
        i.status?.toLowerCase().includes(q)
    );
  }, [interns, debouncedSearch]);

  // Attendance % for an intern
  function attendancePct(internId) {
    const own = records.filter((r) => r.internId === internId);
    if (!own.length) return 0;
    const present = own.filter((r) => r.status === 'Present').length;
    return Math.round((present / own.length) * 100);
  }

  // Task counts for an intern
  function taskCounts(internId) {
    const own = tasks.filter((t) => t.assignedTo?.includes(internId));
    return {
      total: own.length,
      todo: own.filter((t) => t.status === 'To Do').length,
      inProgress: own.filter((t) => t.status === 'In Progress').length,
      underReview: own.filter((t) => t.status === 'Under Review').length,
      completed: own.filter((t) => t.status === 'Completed').length,
    };
  }

  // Add intern
  function handleAdd(data) {
    addIntern(data).then((result) => {
      if (result?.credentials) {
        setNewCredentials(result.credentials);
      }
      showToast('Intern added successfully.', 'success');
      setAddOpen(false);
    }).catch((err) => {
      showToast(err.message || 'Failed to add intern.', 'error');
    });
  }

  // Edit intern
  function handleEdit(data) {
    updateIntern(editIntern.id, data).then(() => {
      showToast('Intern updated successfully.', 'success');
      setEditIntern(null);
    }).catch((err) => {
      showToast(err.message || 'Failed to update intern.', 'error');
    });
  }

  // Delete intern
  function handleDelete() {
    deleteIntern(deleteId).then(() => {
      showToast('Intern removed.', 'success');
      setDeleteId(null);
      setSelected((prev) => { const s = new Set(prev); s.delete(deleteId); return s; });
    }).catch((err) => {
      showToast(err.message || 'Failed to delete intern.', 'error');
    });
  }

  // Bulk status change
  function handleBulkStatus() {
    if (!bulkStatus || selected.size === 0) return;
    bulkUpdateStatus([...selected], bulkStatus).then(() => {
      showToast(`Updated ${selected.size} intern(s) to ${bulkStatus}.`, 'success');
      setSelected(new Set());
      setBulkStatus('');
    }).catch((err) => {
      showToast(err.message || 'Failed to update status.', 'error');
    });
  }

  // Selection helpers
  function toggleSelect(id) {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }
  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  }

  return (
    <section aria-label="Intern Management">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-textPrimary">Intern Management</h1>
        <Button onClick={() => setAddOpen(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Intern
        </Button>
      </div>

      {/* Search + bulk actions */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <label htmlFor="intern-search" className="sr-only">Search interns</label>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            id="intern-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, department, or status…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-textSecondary">{selected.size} selected</span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="text-sm border border-border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Bulk status change"
            >
              <option value="">Change status…</option>
              {BULK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button variant="secondary" onClick={handleBulkStatus} disabled={!bulkStatus}>
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Select all checkbox */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="select-all"
            checked={selected.size === filtered.length && filtered.length > 0}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          <label htmlFor="select-all" className="text-sm text-textSecondary">
            Select all ({filtered.length})
          </label>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-textSecondary text-sm">No interns found matching your search.</p>
        </div>
      )}

      {/* Intern cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((intern) => (
          <div
            key={intern.id}
            className="bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow relative"
          >
            {/* Checkbox */}
            <div className="absolute top-3 left-3 z-10">
              <input
                type="checkbox"
                checked={selected.has(intern.id)}
                onChange={() => toggleSelect(intern.id)}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                aria-label={`Select ${intern.name}`}
              />
            </div>

            {/* Card body — clickable */}
            <button
              type="button"
              className="w-full text-left p-4 pl-9 focus:outline-none focus:ring-2 focus:ring-accent rounded-xl"
              onClick={() => setProfileIntern(intern)}
            >
              <div className="flex items-start gap-3">
                <Avatar name={intern.name} photoUrl={intern.photoUrl} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-textPrimary truncate">{intern.name}</h3>
                    <StatusBadge status={intern.status} />
                  </div>
                  {intern.regNumber && (
                    <p className="text-xs font-mono font-semibold text-accent mt-0.5">{intern.regNumber}</p>
                  )}
                  <p className="text-xs text-textSecondary mt-0.5">{intern.department}</p>
                  <p className="text-xs text-textSecondary">{intern.email}</p>
                  <p className="text-xs text-textSecondary">{intern.phone}</p>
                  {intern.mentor && (
                    <p className="text-xs text-textSecondary mt-1">Mentor: {intern.mentor}</p>
                  )}
                  {intern.startDate && intern.endDate && (
                    <p className="text-xs text-textSecondary">
                      {formatDate(intern.startDate)} → {formatDate(intern.endDate)}
                      {' '}({daysBetween(intern.startDate, intern.endDate)}d)
                    </p>
                  )}
                </div>
              </div>
            </button>

            {/* Actions */}
            <div className="flex justify-end gap-2 px-4 pb-3">
              <Button
                variant="ghost"
                className="text-xs px-2 py-1"
                onClick={() => setEditIntern(intern)}
                aria-label={`Edit ${intern.name}`}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                className="text-xs px-2 py-1 text-danger hover:bg-red-50"
                onClick={() => setDeleteId(intern.id)}
                aria-label={`Delete ${intern.name}`}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Intern Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Intern" size="2xl">
        <InternForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} />
      </Modal>

      {/* Edit Intern Modal */}
      <Modal isOpen={!!editIntern} onClose={() => setEditIntern(null)} title="Edit Intern" size="2xl">
        <InternForm
          initialData={editIntern}
          onSubmit={handleEdit}
          onCancel={() => setEditIntern(null)}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Remove Intern"
        message="Are you sure you want to remove this intern? This action cannot be undone."
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Profile Modal */}
      {profileIntern && (
        <Modal
          isOpen={!!profileIntern}
          onClose={() => setProfileIntern(null)}
          title="Intern Profile"
          size="lg"
        >
          <InternProfileDetail
            intern={profileIntern}
            attendancePct={attendancePct(profileIntern.id)}
            taskCounts={taskCounts(profileIntern.id)}
          />
        </Modal>
      )}

      {/* Auto-generated Credentials Modal */}
      <Modal
        isOpen={!!newCredentials}
        onClose={() => setNewCredentials(null)}
        title="Intern Account Created"
        size="md"
      >
        {newCredentials && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-green-800 mb-1">✅ Account created successfully!</p>
              <p className="text-xs text-green-700">Share these credentials with the intern. The password can be changed after first login.</p>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-textSecondary mb-0.5">Registration Number</p>
                <p className="font-mono font-bold text-accent text-sm">{newCredentials.regNumber}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-textSecondary mb-0.5">Login Email</p>
                <p className="font-mono text-sm text-textPrimary">{newCredentials.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-textSecondary mb-0.5">Auto-generated Password</p>
                <p className="font-mono font-bold text-sm text-textPrimary">{newCredentials.password}</p>
              </div>
            </div>
            <p className="text-xs text-textSecondary mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              ⚠️ Copy these credentials now. The password will not be shown again. The intern can use "Forgot Password" to reset it anytime.
            </p>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setNewCredentials(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

function InternProfileDetail({ intern, attendancePct, taskCounts }) {
  const fields = [
    ['Registration No.', intern.regNumber ? (
      <span className="font-mono font-semibold text-accent">{intern.regNumber}</span>
    ) : '—'],
    ['Full Name', intern.name],
    ['Email', intern.email],
    ['Phone', intern.phone],
    ['Department', intern.department],
    ['Status', intern.status],
    ['Start Date', intern.startDate ? formatDate(intern.startDate) : '—'],
    ['End Date', intern.endDate ? formatDate(intern.endDate) : '—'],
    ['Internship Type', intern.internshipType || '—'],
    ['Mentor', intern.mentor || '—'],
    ['College', intern.college || '—'],
    ['Stipend', intern.stipend ? `₹${intern.stipend}/month` : '—'],
  ];

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <Avatar name={intern.name} photoUrl={intern.photoUrl} size="xl" />
        <div>
          <h3 className="text-lg font-bold text-textPrimary">{intern.name}</h3>
          <StatusBadge status={intern.status} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 mb-5">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-textSecondary">{label}</dt>
            <dd className="text-sm font-medium text-textPrimary">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{attendancePct}%</p>
          <p className="text-xs text-textSecondary mt-1">Attendance</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-textSecondary mb-1">Tasks</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="text-textSecondary">Total:</span><span className="font-medium">{taskCounts.total}</span>
            <span className="text-textSecondary">To Do:</span><span className="font-medium">{taskCounts.todo}</span>
            <span className="text-textSecondary">In Progress:</span><span className="font-medium">{taskCounts.inProgress}</span>
            <span className="text-textSecondary">Completed:</span><span className="font-medium text-green-700">{taskCounts.completed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InternManager;
