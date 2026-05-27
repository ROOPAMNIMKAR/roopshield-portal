/**
 * GuidesModule — Admin page to create and manage task guides / how-to articles.
 *
 * Features:
 * - Create guides with title, summary, step-by-step sections
 * - Category + department visibility filter
 * - Edit and delete guides
 * - Interns see guides on their Resources page
 */
import React, { useEffect, useState } from 'react';
import useGuideStore from '../../store/guideStore';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { Button, Modal, ConfirmDialog } from '../../components/common';

const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Marketing', 'Operations', 'Finance'];
const CATEGORIES  = ['General', 'Onboarding', 'Technical', 'Soft Skills', 'HR & Policy', 'Tools', 'Process'];

const EMPTY_GUIDE = {
  title: '', summary: '', category: 'General', visibleTo: 'All', tags: '',
  steps: [{ heading: '', content: '' }],
};

function GuidesModule() {
  const { guides, loadGuides, addGuide, updateGuide, deleteGuide } = useGuideStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { showToast } = useToast();

  const [addOpen, setAddOpen]     = useState(false);
  const [editGuide, setEditGuide] = useState(null);
  const [viewGuide, setViewGuide] = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [form, setForm]           = useState(EMPTY_GUIDE);
  const [errors, setErrors]       = useState({});
  const [filterCat, setFilterCat] = useState('');

  useEffect(() => { loadGuides(); }, []);

  const filtered = guides.filter((g) => !filterCat || g.category === filterCat);

  /* ── Form helpers ── */
  function openAdd() {
    setForm(EMPTY_GUIDE);
    setErrors({});
    setAddOpen(true);
  }

  function openEdit(guide) {
    setForm({
      title: guide.title,
      summary: guide.summary,
      category: guide.category,
      visibleTo: guide.visibleTo,
      tags: guide.tags,
      steps: guide.steps.length ? guide.steps : [{ heading: '', content: '' }],
    });
    setErrors({});
    setEditGuide(guide);
  }

  function addStep() {
    setForm((p) => ({ ...p, steps: [...p.steps, { heading: '', content: '' }] }));
  }

  function removeStep(idx) {
    setForm((p) => ({ ...p, steps: p.steps.filter((_, i) => i !== idx) }));
  }

  function updateStep(idx, field, value) {
    setForm((p) => {
      const steps = [...p.steps];
      steps[idx] = { ...steps[idx], [field]: value };
      return { ...p, steps };
    });
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (form.steps.every((s) => !s.content.trim())) errs.steps = 'Add at least one step with content.';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = { ...form, createdBy: currentUser?.name ?? 'Admin' };
    if (editGuide) {
      updateGuide(editGuide.id, payload);
      showToast('Guide updated.', 'success');
      setEditGuide(null);
    } else {
      addGuide(payload);
      showToast('Guide published.', 'success');
      setAddOpen(false);
    }
    setForm(EMPTY_GUIDE);
    setErrors({});
  }

  const inputClass = (f) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${errors[f] ? 'border-danger' : 'border-border'}`;

  const CATEGORY_COLORS = {
    General: 'bg-gray-100 text-gray-700',
    Onboarding: 'bg-purple-100 text-purple-700',
    Technical: 'bg-blue-100 text-blue-700',
    'Soft Skills': 'bg-pink-100 text-pink-700',
    'HR & Policy': 'bg-amber-100 text-amber-700',
    Tools: 'bg-cyan-100 text-cyan-700',
    Process: 'bg-green-100 text-green-700',
  };

  const GuideForm = (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <label className="block text-xs font-medium text-textSecondary mb-1">Title <span className="text-danger">*</span></label>
        <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputClass('title')} placeholder="e.g. How to submit a work log" />
        {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-textSecondary mb-1">Summary</label>
        <textarea value={form.summary} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} rows={2} className={inputClass('summary')} placeholder="Brief description of this guide…" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-textSecondary mb-1">Category</label>
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={inputClass('category')}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-textSecondary mb-1">Visible To</label>
          <select value={form.visibleTo} onChange={(e) => setForm((p) => ({ ...p, visibleTo: e.target.value }))} className={inputClass('visibleTo')}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-textSecondary mb-1">Tags (comma-separated)</label>
        <input type="text" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} className={inputClass('tags')} placeholder="e.g. tasks, workflow, tips" />
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-textSecondary">Steps <span className="text-danger">*</span></label>
          <Button type="button" variant="ghost" className="text-xs px-2 py-1" onClick={addStep}>+ Add Step</Button>
        </div>
        {errors.steps && <p className="text-xs text-danger mb-2">{errors.steps}</p>}
        <div className="space-y-3">
          {form.steps.map((step, idx) => (
            <div key={idx} className="border border-border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-textSecondary">Step {idx + 1}</span>
                {form.steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(idx)} className="text-xs text-danger hover:underline focus:outline-none">Remove</button>
                )}
              </div>
              <input
                type="text"
                value={step.heading}
                onChange={(e) => updateStep(idx, 'heading', e.target.value)}
                placeholder="Step heading (optional)"
                className="w-full border border-border rounded-lg px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <textarea
                value={step.content}
                onChange={(e) => updateStep(idx, 'content', e.target.value)}
                placeholder="Step instructions…"
                rows={3}
                className="w-full border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        <Button type="button" variant="secondary" onClick={() => { setAddOpen(false); setEditGuide(null); }}>Cancel</Button>
        <Button type="submit">{editGuide ? 'Update Guide' : 'Publish Guide'}</Button>
      </div>
    </form>
  );

  return (
    <section aria-label="Task Guides">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Task Guides</h1>
          <p className="text-sm text-textSecondary mt-0.5">Step-by-step guides for interns</p>
        </div>
        <Button onClick={openAdd}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Guide
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['', ...CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
              filterCat === c ? 'bg-accent text-white' : 'bg-white border border-border text-textSecondary hover:text-textPrimary'
            }`}
          >
            {c || 'All'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <svg className="h-14 w-14 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-textSecondary text-sm">No guides yet. Create the first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((guide) => (
            <div key={guide.id} className="bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-textPrimary leading-snug">{guide.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${CATEGORY_COLORS[guide.category] ?? 'bg-gray-100 text-gray-700'}`}>
                    {guide.category}
                  </span>
                </div>
                {guide.summary && <p className="text-xs text-textSecondary mb-3 line-clamp-2">{guide.summary}</p>}
                <div className="flex items-center gap-2 text-xs text-textSecondary mb-3">
                  <span>{guide.steps.length} step{guide.steps.length !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span>{guide.visibleTo}</span>
                  <span>·</span>
                  <span>{new Date(guide.createdAt).toLocaleDateString()}</span>
                </div>
                {guide.tags && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {guide.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button variant="ghost" className="text-xs px-2 py-1 flex-1" onClick={() => setViewGuide(guide)}>View</Button>
                  <Button variant="ghost" className="text-xs px-2 py-1 flex-1" onClick={() => openEdit(guide)}>Edit</Button>
                  <Button variant="ghost" className="text-xs px-2 py-1 text-danger hover:bg-red-50" onClick={() => setDeleteId(guide.id)} aria-label="Delete guide">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Create Task Guide" size="xl">{GuideForm}</Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editGuide} onClose={() => setEditGuide(null)} title="Edit Guide" size="xl">{GuideForm}</Modal>

      {/* View Modal */}
      {viewGuide && (
        <Modal isOpen={!!viewGuide} onClose={() => setViewGuide(null)} title={viewGuide.title} size="xl">
          <GuideViewer guide={viewGuide} />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Guide"
        message="Are you sure you want to delete this guide?"
        confirmLabel="Delete"
        onConfirm={() => { deleteGuide(deleteId); showToast('Guide deleted.', 'success'); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </section>
  );
}

export function GuideViewer({ guide }) {
  return (
    <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-4">
      {guide.summary && <p className="text-sm text-textSecondary">{guide.summary}</p>}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{guide.category}</span>
        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{guide.visibleTo}</span>
        {guide.tags && guide.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
          <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{tag}</span>
        ))}
      </div>
      <div className="space-y-4 pt-2">
        {guide.steps.map((step, idx) => (
          <div key={idx} className="border-l-4 border-accent pl-4">
            <p className="text-xs font-bold text-accent mb-1">Step {idx + 1}{step.heading ? ` — ${step.heading}` : ''}</p>
            <p className="text-sm text-textPrimary whitespace-pre-wrap">{step.content}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-textSecondary pt-2 border-t border-border">
        Posted by {guide.createdBy} · {new Date(guide.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export default GuidesModule;
