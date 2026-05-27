/**
 * InternTasks — Intern task list page.
 *
 * Features:
 * - All tasks assigned to the logged-in intern
 * - Filter by status and priority
 * - Status update control per task
 * - "Add Work Log" button → form with validation
 *
 * Requirements: 9.1–9.4
 */
import React, { useEffect, useState, useMemo } from 'react';
import useAuthStore from '../../store/authStore';
import useTaskStore from '../../store/taskStore';
import { useToast } from '../../hooks/useToast';
import { Button, Modal, StatusBadge, PriorityBadge } from '../../components/common';
import { formatDate, isOverdue } from '../../utils/dateUtils';

const TASK_STATUSES = ['', 'To Do', 'In Progress', 'Under Review', 'Completed'];
const PRIORITIES = ['', 'Low', 'Medium', 'High', 'Critical'];

function InternTasks() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { tasks, loadTasks, updateTaskStatus, addWorkLog } = useTaskStore();
  const { showToast } = useToast();

  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [workLogTask, setWorkLogTask] = useState(null);
  const [logForm, setLogForm] = useState({ date: '', hoursWorked: '', notes: '' });
  const [logErrors, setLogErrors] = useState({});

  useEffect(() => { loadTasks(); }, []);

  const internId = currentUser?.id;
  const internName = currentUser?.name ?? 'Intern';

  const myTasks = useMemo(
    () => tasks.filter((t) => t.assignedTo?.includes(internId)),
    [tasks, internId]
  );

  const filtered = useMemo(() => {
    return myTasks.filter((t) => {
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      return true;
    });
  }, [myTasks, filterStatus, filterPriority]);

  function handleStatusChange(taskId, newStatus) {
    updateTaskStatus(taskId, newStatus, internName);
    showToast('Status updated.', 'success');
  }

  function openWorkLog(task) {
    setWorkLogTask(task);
    setLogForm({ date: new Date().toISOString().slice(0, 10), hoursWorked: '', notes: '' });
    setLogErrors({});
  }

  function handleLogSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!logForm.date) errs.date = 'Date is required.';
    const hours = parseFloat(logForm.hoursWorked);
    if (!logForm.hoursWorked || isNaN(hours) || hours <= 0) {
      errs.hoursWorked = 'Hours Worked must be a number greater than 0.';
    }
    if (Object.keys(errs).length) { setLogErrors(errs); return; }

    const saved = addWorkLog(workLogTask.id, {
      date: logForm.date,
      hoursWorked: hours,
      notes: logForm.notes,
      loggedBy: internName,
    });

    if (saved) {
      showToast('Work log added.', 'success');
      setWorkLogTask(null);
    }
  }

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${
      logErrors[field] ? 'border-danger' : 'border-border'
    }`;

  return (
    <section aria-label="My Tasks">
      <h1 className="text-2xl font-bold text-textPrimary mb-6">My Tasks</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {TASK_STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="text-sm border border-border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Filter by priority"
        >
          <option value="">All Priorities</option>
          {PRIORITIES.filter(Boolean).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <svg className="h-14 w-14 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-textSecondary text-sm">No tasks found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((task) => {
            const overdue = task.status !== 'Completed' && isOverdue(task.dueDate);
            const loggedHours = (task.workLogs ?? []).reduce((s, l) => s + (l.hoursWorked ?? 0), 0);
            const progress = task.estimatedHours > 0
              ? Math.min(100, Math.round((loggedHours / task.estimatedHours) * 100))
              : 0;

            return (
              <div key={task.id} className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-textPrimary">{task.title}</h3>
                    {task.category && (
                      <p className="text-xs text-textSecondary mt-0.5">{task.category}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-textSecondary mb-3 line-clamp-2">{task.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-textSecondary">
                  <span className={overdue ? 'text-danger font-semibold' : ''}>
                    Due: {formatDate(task.dueDate)}{overdue && ' (Overdue)'}
                  </span>
                  {task.estimatedHours && (
                    <span>{loggedHours}h / {task.estimatedHours}h logged</span>
                  )}
                </div>

                {/* Progress bar */}
                {task.estimatedHours > 0 && (
                  <div className="mb-3">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemax={100}
                        aria-label={`${progress}% complete`}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
                  <label htmlFor={`status-${task.id}`} className="text-xs text-textSecondary">Update status:</label>
                  <select
                    id={`status-${task.id}`}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="text-xs border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {TASK_STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Button
                    variant="secondary"
                    className="text-xs px-3 py-1.5"
                    onClick={() => openWorkLog(task)}
                  >
                    + Work Log
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Work Log Modal */}
      <Modal
        isOpen={!!workLogTask}
        onClose={() => setWorkLogTask(null)}
        title={`Add Work Log — ${workLogTask?.title ?? ''}`}
        size="md"
      >
        <form onSubmit={handleLogSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="wl-date" className="block text-xs font-medium text-textSecondary mb-1">
                Date <span className="text-danger">*</span>
              </label>
              <input
                id="wl-date"
                type="date"
                value={logForm.date}
                onChange={(e) => setLogForm((p) => ({ ...p, date: e.target.value }))}
                className={inputClass('date')}
                aria-required="true"
              />
              {logErrors.date && <p className="text-xs text-danger mt-1">{logErrors.date}</p>}
            </div>

            <div>
              <label htmlFor="wl-hours" className="block text-xs font-medium text-textSecondary mb-1">
                Hours Worked <span className="text-danger">*</span>
              </label>
              <input
                id="wl-hours"
                type="number"
                min="0.1"
                step="0.5"
                value={logForm.hoursWorked}
                onChange={(e) => setLogForm((p) => ({ ...p, hoursWorked: e.target.value }))}
                className={inputClass('hoursWorked')}
                aria-required="true"
              />
              {logErrors.hoursWorked && (
                <p className="text-xs text-danger mt-1">{logErrors.hoursWorked}</p>
              )}
            </div>

            <div>
              <label htmlFor="wl-notes" className="block text-xs font-medium text-textSecondary mb-1">Notes</label>
              <textarea
                id="wl-notes"
                value={logForm.notes}
                onChange={(e) => setLogForm((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                className={inputClass('notes')}
                placeholder="What did you work on?"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setWorkLogTask(null)}>Cancel</Button>
            <Button type="submit">Save Log</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default InternTasks;
