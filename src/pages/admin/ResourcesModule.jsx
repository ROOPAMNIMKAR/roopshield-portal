/**
 * ResourcesModule — Admin page to post video guides and resources.
 */
import React, { useEffect, useState } from 'react';
import useResourceStore from '../../store/resourceStore';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { Button, Modal, ConfirmDialog } from '../../components/common';

const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Marketing', 'Operations', 'Finance'];
const CATEGORIES  = ['General', 'Technical', 'Soft Skills', 'HR & Policy', 'Tools & Software', 'Other'];

const EMPTY = { title: '', description: '', url: '', category: 'General', visibleTo: 'All' };

function isYouTube(url) {
  return /youtube\.com|youtu\.be/.test(url);
}

function getYouTubeId(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function ResourceCard({ resource, onDelete }) {
  const ytId = isYouTube(resource.url) ? getYouTubeId(resource.url) : null;
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      {ytId ? (
        <div className="aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={resource.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center h-32 bg-gradient-to-br from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <svg className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Open Resource
        </a>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-textPrimary text-sm">{resource.title}</h3>
          <Button
            variant="ghost"
            className="text-xs px-2 py-1 text-danger hover:bg-red-50 shrink-0"
            onClick={() => onDelete(resource.id)}
            aria-label={`Delete ${resource.title}`}
          >
            Delete
          </Button>
        </div>
        {resource.description && (
          <p className="text-xs text-textSecondary mb-2">{resource.description}</p>
        )}
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{resource.category}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{resource.visibleTo}</span>
        </div>
        <p className="text-xs text-textSecondary mt-2">
          Posted by {resource.createdBy} · {new Date(resource.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function ResourcesModule() {
  const { resources, loadResources, addResource, deleteResource } = useResourceStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { showToast } = useToast();

  const [addOpen, setAddOpen]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});

  useEffect(() => { loadResources(); }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.url.trim())   errs.url   = 'URL is required.';
    else {
      try { new URL(form.url); } catch { errs.url = 'Enter a valid URL.'; }
    }
    return errs;
  }

  function handlePost(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    addResource({ ...form, createdBy: currentUser?.name ?? 'Admin' });
    showToast('Resource posted.', 'success');
    setAddOpen(false);
    setForm(EMPTY);
    setErrors({});
  }

  const inputClass = (f) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${errors[f] ? 'border-danger' : 'border-border'}`;

  return (
    <section aria-label="Video Guides & Resources">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-textPrimary">Video Guides & Resources</h1>
        <Button onClick={() => { setAddOpen(true); setForm(EMPTY); setErrors({}); }}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Resource
        </Button>
      </div>

      {resources.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <svg className="h-14 w-14 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.263a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
          <p className="text-textSecondary text-sm">No resources posted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Resource / Video Guide" size="lg">
        <form onSubmit={handlePost} noValidate className="space-y-4">
          <div>
            <label htmlFor="rm-title" className="block text-xs font-medium text-textSecondary mb-1">Title <span className="text-danger">*</span></label>
            <input id="rm-title" name="title" type="text" value={form.title} onChange={handleChange} className={inputClass('title')} />
            {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor="rm-url" className="block text-xs font-medium text-textSecondary mb-1">
              Video / Resource URL <span className="text-danger">*</span>
              <span className="ml-1 text-textSecondary font-normal">(YouTube links will embed automatically)</span>
            </label>
            <input id="rm-url" name="url" type="url" value={form.url} onChange={handleChange} className={inputClass('url')} placeholder="https://youtube.com/watch?v=… or any URL" />
            {errors.url && <p className="text-xs text-danger mt-1">{errors.url}</p>}
          </div>
          <div>
            <label htmlFor="rm-desc" className="block text-xs font-medium text-textSecondary mb-1">Description</label>
            <textarea id="rm-desc" name="description" value={form.description} onChange={handleChange} rows={2} className={inputClass('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rm-category" className="block text-xs font-medium text-textSecondary mb-1">Category</label>
              <select id="rm-category" name="category" value={form.category} onChange={handleChange} className={inputClass('category')}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="rm-visible" className="block text-xs font-medium text-textSecondary mb-1">Visible To</label>
              <select id="rm-visible" name="visibleTo" value={form.visibleTo} onChange={handleChange} className={inputClass('visibleTo')}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit">Post Resource</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Resource"
        message="Are you sure you want to delete this resource?"
        confirmLabel="Delete"
        onConfirm={() => { deleteResource(deleteId); showToast('Resource deleted.', 'success'); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </section>
  );
}

export default ResourcesModule;
