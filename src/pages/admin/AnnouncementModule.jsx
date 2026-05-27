/**
 * AnnouncementModule — Admin announcements page.
 *
 * Features:
 * - Announcement cards with colored left border
 * - "Post Announcement" button → modal form
 * - Delete with ConfirmDialog
 * - Inline validation for empty Title/Body
 *
 * Requirements: 11.1–11.6
 */
import React, { useEffect, useState } from 'react';
import useAnnouncementStore from '../../store/announcementStore';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { Button, Modal, ConfirmDialog } from '../../components/common';

const IMPORTANCE_STYLES = {
  Info:      { border: 'border-l-blue-500',  badge: 'bg-blue-100 text-blue-800' },
  Warning:   { border: 'border-l-amber-500', badge: 'bg-amber-100 text-amber-800' },
  Important: { border: 'border-l-danger',    badge: 'bg-red-100 text-red-700' },
};

const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Marketing', 'Operations', 'Finance'];
const IMPORTANCES = ['Info', 'Warning', 'Important'];

const EMPTY_FORM = { title: '', body: '', importance: 'Info', visibleTo: 'All' };

function AnnouncementModule() {
  const { announcements, loadAnnouncements, addAnnouncement, deleteAnnouncement } =
    useAnnouncementStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { showToast } = useToast();

  const [postOpen, setPostOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => { loadAnnouncements(); }, []);

  const sorted = [...announcements].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.body.trim()) errs.body = 'Body is required.';
    return errs;
  }

  function handlePost(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    addAnnouncement({
      ...form,
      title: form.title.trim(),
      body: form.body.trim(),
      createdBy: currentUser?.name ?? 'Admin',
    });
    showToast('Announcement posted.', 'success');
    setPostOpen(false);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function handleDelete() {
    deleteAnnouncement(deleteId);
    showToast('Announcement deleted.', 'success');
    setDeleteId(null);
  }

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${
      errors[field] ? 'border-danger' : 'border-border'
    }`;

  return (
    <section aria-label="Announcements">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-textPrimary">Announcements</h1>
        <Button onClick={() => { setPostOpen(true); setForm(EMPTY_FORM); setErrors({}); }}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Post Announcement
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <svg className="h-14 w-14 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <p className="text-textSecondary text-sm">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((ann) => {
            const style = IMPORTANCE_STYLES[ann.importance] ?? IMPORTANCE_STYLES.Info;
            return (
              <article
                key={ann.id}
                className={`bg-white rounded-xl border border-border border-l-4 ${style.border} p-5 shadow-sm`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-textPrimary">{ann.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                        {ann.importance}
                      </span>
                      <span className="text-xs text-textSecondary bg-gray-100 px-2 py-0.5 rounded-full">
                        {ann.visibleTo}
                      </span>
                    </div>
                    <p className="text-sm text-textPrimary mb-2">{ann.body}</p>
                    <p className="text-xs text-textSecondary">
                      Posted by {ann.createdBy} · {new Date(ann.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-xs px-2 py-1 text-danger hover:bg-red-50 shrink-0"
                    onClick={() => setDeleteId(ann.id)}
                    aria-label={`Delete announcement: ${ann.title}`}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Post Modal */}
      <Modal isOpen={postOpen} onClose={() => setPostOpen(false)} title="Post Announcement" size="lg">
        <form onSubmit={handlePost} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="am-title" className="block text-xs font-medium text-textSecondary mb-1">
                Title <span className="text-danger">*</span>
              </label>
              <input
                id="am-title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                className={inputClass('title')}
                aria-required="true"
              />
              {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="am-body" className="block text-xs font-medium text-textSecondary mb-1">
                Body <span className="text-danger">*</span>
              </label>
              <textarea
                id="am-body"
                name="body"
                value={form.body}
                onChange={handleChange}
                rows={4}
                className={inputClass('body')}
                aria-required="true"
              />
              {errors.body && <p className="text-xs text-danger mt-1">{errors.body}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="am-importance" className="block text-xs font-medium text-textSecondary mb-1">
                  Importance <span className="text-danger">*</span>
                </label>
                <select
                  id="am-importance"
                  name="importance"
                  value={form.importance}
                  onChange={handleChange}
                  className={inputClass('importance')}
                >
                  {IMPORTANCES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="am-visibleTo" className="block text-xs font-medium text-textSecondary mb-1">
                  Visible To
                </label>
                <select
                  id="am-visibleTo"
                  name="visibleTo"
                  value={form.visibleTo}
                  onChange={handleChange}
                  className={inputClass('visibleTo')}
                >
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setPostOpen(false)}>Cancel</Button>
            <Button type="submit">Post</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement?"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </section>
  );
}

export default AnnouncementModule;
