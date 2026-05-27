/**
 * InternLeave — Intern can apply for leave and track request status.
 */
import React, { useEffect, useState, useMemo } from 'react';
import useAuthStore from '../../store/authStore';
import useHRStore from '../../store/hrStore';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/common';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Emergency Leave', 'Work From Home', 'Other'];

const STATUS_STYLE = {
  Pending:  'bg-amber-100 text-amber-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

function InternLeave() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { leaveRequests, loadAll, submitLeaveRequest } = useHRStore();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    leaveType: 'Sick Leave', fromDate: '', toDate: '', reason: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => { loadAll(); }, []);

  const myRequests = useMemo(
    () => leaveRequests
      .filter((r) => r.internId === currentUser?.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [leaveRequests, currentUser]
  );

  function validate() {
    const errs = {};
    if (!form.fromDate) errs.fromDate = 'From date is required.';
    if (!form.toDate)   errs.toDate   = 'To date is required.';
    else if (form.fromDate && form.toDate < form.fromDate) errs.toDate = 'To date must be on or after From date.';
    if (!form.reason.trim()) errs.reason = 'Reason is required.';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    submitLeaveRequest({
      internId:   currentUser.id,
      internName: currentUser.name,
      ...form,
      reason: form.reason.trim(),
    });
    showToast('Leave request submitted.', 'success');
    setForm({ leaveType: 'Sick Leave', fromDate: '', toDate: '', reason: '' });
    setErrors({});
  }

  const ic = (f) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${errors[f] ? 'border-danger' : 'border-border'}`;

  return (
    <section aria-label="Leave Requests">
      <h1 className="text-2xl font-bold text-textPrimary mb-6">Leave Requests</h1>

      {/* Apply form */}
      <div className="bg-white rounded-xl border border-border p-5 mb-8">
        <h2 className="text-base font-semibold text-textPrimary mb-4">Apply for Leave</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lv-type" className="block text-xs font-medium text-textSecondary mb-1">
                Leave Type <span className="text-danger">*</span>
              </label>
              <select id="lv-type" value={form.leaveType}
                onChange={(e) => setForm((p) => ({ ...p, leaveType: e.target.value }))}
                className={ic('leaveType')}>
                {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div /> {/* spacer */}

            <div>
              <label htmlFor="lv-from" className="block text-xs font-medium text-textSecondary mb-1">
                From Date <span className="text-danger">*</span>
              </label>
              <input id="lv-from" type="date" value={form.fromDate}
                onChange={(e) => { setForm((p) => ({ ...p, fromDate: e.target.value })); if (errors.fromDate) setErrors((p) => ({ ...p, fromDate: '' })); }}
                className={ic('fromDate')} />
              {errors.fromDate && <p className="text-xs text-danger mt-1">{errors.fromDate}</p>}
            </div>

            <div>
              <label htmlFor="lv-to" className="block text-xs font-medium text-textSecondary mb-1">
                To Date <span className="text-danger">*</span>
              </label>
              <input id="lv-to" type="date" value={form.toDate}
                onChange={(e) => { setForm((p) => ({ ...p, toDate: e.target.value })); if (errors.toDate) setErrors((p) => ({ ...p, toDate: '' })); }}
                className={ic('toDate')} />
              {errors.toDate && <p className="text-xs text-danger mt-1">{errors.toDate}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="lv-reason" className="block text-xs font-medium text-textSecondary mb-1">
                Reason <span className="text-danger">*</span>
              </label>
              <textarea id="lv-reason" value={form.reason}
                onChange={(e) => { setForm((p) => ({ ...p, reason: e.target.value })); if (errors.reason) setErrors((p) => ({ ...p, reason: '' })); }}
                rows={3} className={ic('reason')} placeholder="Briefly explain your reason…" />
              {errors.reason && <p className="text-xs text-danger mt-1">{errors.reason}</p>}
            </div>
          </div>

          <div className="mt-4">
            <Button type="submit">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Submit Request
            </Button>
          </div>
        </form>
      </div>

      {/* My requests */}
      <h2 className="text-base font-semibold text-textPrimary mb-4">My Requests ({myRequests.length})</h2>
      {myRequests.length === 0 ? (
        <p className="text-textSecondary text-sm">No leave requests submitted yet.</p>
      ) : (
        <div className="space-y-3">
          {myRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-textPrimary">{req.leaveType}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[req.status]}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary mt-0.5">
                    {req.fromDate} → {req.toDate} · Applied {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-textPrimary">{req.reason}</p>
              {req.adminComment && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-0.5">
                    Admin note {req.updatedAt ? `· ${new Date(req.updatedAt).toLocaleDateString()}` : ''}
                  </p>
                  <p className="text-sm text-textPrimary">{req.adminComment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default InternLeave;
