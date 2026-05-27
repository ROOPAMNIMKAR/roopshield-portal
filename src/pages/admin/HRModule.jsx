/**
 * HRModule — Admin HR Management page.
 *
 * Tabs:
 *   1. Leave Requests  — view/approve/reject intern leave requests
 *   2. HR Notices      — post notices (policies, events, reminders)
 *   3. Documents       — upload/link HR documents (policies, forms, templates)
 *   4. Departments     — manage department list (add/delete custom departments)
 */
import React, { useEffect, useState, useMemo } from 'react';
import useHRStore from '../../store/hrStore';
import useAuthStore from '../../store/authStore';
import useDepartmentStore from '../../store/departmentStore';
import { useToast } from '../../hooks/useToast';
import { Button, Modal, ConfirmDialog, StatusBadge } from '../../components/common';

const TABS = ['Leave Requests', 'HR Notices', 'Documents', 'Departments'];
const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Emergency Leave', 'Work From Home', 'Other'];
const NOTICE_CATEGORIES = ['General', 'Policy Update', 'Event', 'Holiday', 'Reminder', 'Urgent'];
const DOC_CATEGORIES = ['Policy', 'Form', 'Template', 'Handbook', 'Certificate', 'Other'];
const DEPARTMENTS_VIS = ['All', 'Engineering', 'Design', 'Marketing', 'Operations', 'Finance',
  'Cybersecurity', 'Web Development', 'Mobile App Development',
  'Full-Stack Development', 'Cybersecurity Analysis', 'Software Testing', 'HR'];

const STATUS_STYLE = {
  Pending:  'bg-amber-100 text-amber-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

function HRModule() {
  const [activeTab, setActiveTab] = useState(0);
  const { leaveRequests, notices, documents, loadAll,
          updateLeaveStatus, deleteLeaveRequest,
          addNotice, deleteNotice,
          addDocument, deleteDocument } = useHRStore();
  const { departments, loadDepartments, addDepartment, deleteDepartment } = useDepartmentStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { showToast } = useToast();

  useEffect(() => { loadAll(); loadDepartments(); }, []);

  const pendingCount = leaveRequests.filter((r) => r.status === 'Pending').length;

  return (
    <section aria-label="HR Management">
      <h1 className="text-2xl font-bold text-textPrimary mb-6">HR Management</h1>

      {/* Tab bar */}
      <div className="flex border-b border-border mb-6 overflow-x-auto" role="tablist">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === idx}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent -mb-px whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === idx
                ? 'border-accent text-accent'
                : 'border-transparent text-textSecondary hover:text-textPrimary'
            }`}
          >
            {tab}
            {idx === 0 && pendingCount > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === 0 ? 'bg-accent text-white' : 'bg-amber-100 text-amber-700'}`}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <LeaveTab
          requests={leaveRequests}
          onUpdate={updateLeaveStatus}
          onDelete={deleteLeaveRequest}
          currentUser={currentUser}
          showToast={showToast}
        />
      )}
      {activeTab === 1 && (
        <NoticesTab
          notices={notices}
          onAdd={addNotice}
          onDelete={deleteNotice}
          currentUser={currentUser}
          showToast={showToast}
        />
      )}
      {activeTab === 2 && (
        <DocumentsTab
          documents={documents}
          onAdd={addDocument}
          onDelete={deleteDocument}
          currentUser={currentUser}
          showToast={showToast}
        />
      )}
      {activeTab === 3 && (
        <DepartmentsTab
          departments={departments}
          onAdd={addDepartment}
          onDelete={deleteDepartment}
          showToast={showToast}
        />
      )}
    </section>
  );
}

/* ─── Tab 1: Leave Requests ─────────────────────────────────────────────── */
function LeaveTab({ requests, onUpdate, onDelete, currentUser, showToast }) {
  const [filterStatus, setFilterStatus] = useState('');
  const [reviewTarget, setReviewTarget] = useState(null);
  const [comment, setComment] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() => {
    const sorted = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filterStatus ? sorted.filter((r) => r.status === filterStatus) : sorted;
  }, [requests, filterStatus]);

  function handleDecision(status) {
    onUpdate(reviewTarget.id, { status, adminComment: comment, updatedBy: currentUser?.name ?? 'Admin' });
    showToast(`Leave request ${status.toLowerCase()}.`, status === 'Approved' ? 'success' : 'warning');
    setReviewTarget(null);
    setComment('');
  }

  return (
    <div>
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['', 'Pending', 'Approved', 'Rejected'].map((s) => (
          <button key={s} type="button" onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
              filterStatus === s ? 'bg-accent text-white' : 'bg-white border border-border text-textSecondary hover:text-textPrimary'
            }`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📋" text="No leave requests found." />
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-textPrimary">{req.internName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[req.status]}`}>{req.status}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{req.leaveType}</span>
                  </div>
                  <p className="text-xs text-textSecondary mt-0.5">
                    {req.fromDate} → {req.toDate} · Applied {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {req.status === 'Pending' && (
                    <Button variant="secondary" className="text-xs px-3 py-1.5"
                      onClick={() => { setReviewTarget(req); setComment(''); }}>
                      Review
                    </Button>
                  )}
                  <Button variant="ghost" className="text-xs px-2 py-1.5 text-danger hover:bg-red-50"
                    onClick={() => setDeleteId(req.id)} aria-label="Delete request">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
              <p className="text-sm text-textPrimary">{req.reason}</p>
              {req.adminComment && (
                <div className="mt-2 bg-gray-50 rounded-lg p-2 text-xs text-textSecondary">
                  <span className="font-medium">Admin note:</span> {req.adminComment}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={!!reviewTarget} onClose={() => setReviewTarget(null)}
        title={`Review Leave — ${reviewTarget?.internName ?? ''}`} size="md">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p><span className="text-textSecondary">Type:</span> <strong>{reviewTarget?.leaveType}</strong></p>
            <p><span className="text-textSecondary">Dates:</span> {reviewTarget?.fromDate} → {reviewTarget?.toDate}</p>
            <p className="mt-1"><span className="text-textSecondary">Reason:</span> {reviewTarget?.reason}</p>
          </div>
          <div>
            <label htmlFor="hr-comment" className="block text-xs font-medium text-textSecondary mb-1">Comment (optional)</label>
            <textarea id="hr-comment" value={comment} onChange={(e) => setComment(e.target.value)}
              rows={3} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Add a note for the intern…" />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setReviewTarget(null)}>Cancel</Button>
            <Button type="button" variant="danger" onClick={() => handleDecision('Rejected')}>Reject</Button>
            <Button type="button" onClick={() => handleDecision('Approved')}>Approve</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Request"
        message="Delete this leave request permanently?"
        confirmLabel="Delete"
        onConfirm={() => { onDelete(deleteId); showToast('Deleted.', 'success'); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)} />
    </div>
  );
}

/* ─── Tab 2: HR Notices ──────────────────────────────────────────────────── */
function NoticesTab({ notices, onAdd, onDelete, currentUser, showToast }) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', category: 'General', visibleTo: 'All' });
  const [errors, setErrors] = useState({});

  function handlePost(e) {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.body.trim())  errs.body  = 'Body is required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onAdd({ ...form, createdBy: currentUser?.name ?? 'Admin' });
    showToast('Notice posted.', 'success');
    setAddOpen(false);
    setForm({ title: '', body: '', category: 'General', visibleTo: 'All' });
    setErrors({});
  }

  const ic = (f) => `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${errors[f] ? 'border-danger' : 'border-border'}`;

  return (
    <div>
      <div className="flex justify-end mb-5">
        <Button onClick={() => { setAddOpen(true); setForm({ title: '', body: '', category: 'General', visibleTo: 'All' }); setErrors({}); }}>
          + Post Notice
        </Button>
      </div>

      {notices.length === 0 ? (
        <EmptyState icon="📢" text="No HR notices yet." />
      ) : (
        <div className="space-y-3">
          {[...notices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-textPrimary">{n.title}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{n.category}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{n.visibleTo}</span>
                  </div>
                  <p className="text-sm text-textPrimary mb-1">{n.body}</p>
                  <p className="text-xs text-textSecondary">By {n.createdBy} · {new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" className="text-xs px-2 py-1 text-danger hover:bg-red-50 shrink-0"
                  onClick={() => setDeleteId(n.id)} aria-label="Delete notice">Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Post HR Notice" size="lg">
        <form onSubmit={handlePost} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-textSecondary mb-1">Title <span className="text-danger">*</span></label>
            <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={ic('title')} />
            {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-textSecondary mb-1">Body <span className="text-danger">*</span></label>
            <textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} rows={4} className={ic('body')} />
            {errors.body && <p className="text-xs text-danger mt-1">{errors.body}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={ic('category')}>
                {NOTICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">Visible To</label>
              <select value={form.visibleTo} onChange={(e) => setForm((p) => ({ ...p, visibleTo: e.target.value }))} className={ic('visibleTo')}>
                {DEPARTMENTS_VIS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit">Post</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Notice" message="Delete this HR notice?"
        confirmLabel="Delete"
        onConfirm={() => { onDelete(deleteId); showToast('Deleted.', 'success'); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)} />
    </div>
  );
}

/* ─── Tab 3: Documents ───────────────────────────────────────────────────── */
function DocumentsTab({ documents, onAdd, onDelete, currentUser, showToast }) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', url: '', category: 'Policy' });
  const [errors, setErrors] = useState({});

  function handleAdd(e) {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.url.trim())   errs.url   = 'URL is required.';
    else { try { new URL(form.url); } catch { errs.url = 'Enter a valid URL.'; } }
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onAdd({ ...form, createdBy: currentUser?.name ?? 'Admin' });
    showToast('Document added.', 'success');
    setAddOpen(false);
    setForm({ title: '', description: '', url: '', category: 'Policy' });
    setErrors({});
  }

  const ic = (f) => `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${errors[f] ? 'border-danger' : 'border-border'}`;

  const CAT_COLORS = {
    Policy: 'bg-blue-100 text-blue-700', Form: 'bg-purple-100 text-purple-700',
    Template: 'bg-cyan-100 text-cyan-700', Handbook: 'bg-green-100 text-green-700',
    Certificate: 'bg-amber-100 text-amber-700', Other: 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      <div className="flex justify-end mb-5">
        <Button onClick={() => { setAddOpen(true); setForm({ title: '', description: '', url: '', category: 'Policy' }); setErrors({}); }}>
          + Add Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <EmptyState icon="📄" text="No documents yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...documents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-border p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-textPrimary text-sm">{doc.title}</h3>
                  {doc.description && <p className="text-xs text-textSecondary mt-0.5">{doc.description}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${CAT_COLORS[doc.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {doc.category}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-border">
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline focus:outline-none truncate">
                  Open Document ↗
                </a>
                <Button variant="ghost" className="text-xs px-2 py-1 text-danger hover:bg-red-50 shrink-0"
                  onClick={() => setDeleteId(doc.id)} aria-label="Delete document">Delete</Button>
              </div>
              <p className="text-xs text-textSecondary">By {doc.createdBy} · {new Date(doc.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add HR Document" size="md">
        <form onSubmit={handleAdd} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-textSecondary mb-1">Title <span className="text-danger">*</span></label>
            <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={ic('title')} />
            {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-textSecondary mb-1">Document URL <span className="text-danger">*</span></label>
            <input type="url" value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} className={ic('url')} placeholder="https://drive.google.com/…" />
            {errors.url && <p className="text-xs text-danger mt-1">{errors.url}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-textSecondary mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className={ic('description')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-textSecondary mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={ic('category')}>
              {DOC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Document" message="Delete this document?"
        confirmLabel="Delete"
        onConfirm={() => { onDelete(deleteId); showToast('Deleted.', 'success'); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)} />
    </div>
  );
}

/* ─── Tab 4: Departments ─────────────────────────────────────────────────── */
function DepartmentsTab({ departments, onAdd, onDelete, showToast }) {
  const [newDept, setNewDept] = useState('');
  const [error, setError]     = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  function handleAdd(e) {
    e.preventDefault();
    if (!newDept.trim()) { setError('Department name is required.'); return; }
    const added = onAdd(newDept);
    if (!added) { setError('Department already exists.'); return; }
    showToast(`Department "${newDept.trim()}" added.`, 'success');
    setNewDept('');
    setError('');
  }

  return (
    <div className="max-w-lg">
      <p className="text-sm text-textSecondary mb-5">
        Manage the list of departments available when adding interns. Default departments cannot be deleted.
      </p>

      {/* Add new */}
      <form onSubmit={handleAdd} noValidate className="flex gap-2 mb-6">
        <div className="flex-1">
          <label htmlFor="dept-new" className="sr-only">New department name</label>
          <input
            id="dept-new"
            type="text"
            value={newDept}
            onChange={(e) => { setNewDept(e.target.value); setError(''); }}
            placeholder="e.g. Data Science, UI/UX Design…"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${error ? 'border-danger' : 'border-border'}`}
          />
          {error && <p className="text-xs text-danger mt-1">{error}</p>}
        </div>
        <Button type="submit">Add</Button>
      </form>

      {/* Department list */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-border">
          <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide">
            All Departments ({departments.length})
          </p>
        </div>
        <ul className="divide-y divide-border">
          {departments.map((dept) => (
            <li key={dept} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-textPrimary">{dept}</span>
              <button
                type="button"
                onClick={() => setDeleteTarget(dept)}
                className="text-xs text-danger hover:underline focus:outline-none"
                aria-label={`Delete ${dept}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Department"
        message={`Remove "${deleteTarget}" from the department list? Existing interns in this department will not be affected.`}
        confirmLabel="Remove"
        onConfirm={() => { onDelete(deleteTarget); showToast(`"${deleteTarget}" removed.`, 'success'); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="text-5xl mb-3" aria-hidden="true">{icon}</span>
      <p className="text-textSecondary text-sm">{text}</p>
    </div>
  );
}

export default HRModule;
