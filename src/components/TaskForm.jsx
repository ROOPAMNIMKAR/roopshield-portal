/**
 * TaskForm — Add/Edit task form.
 *
 * Fields: Title, Description, Assigned To (multi-select), Priority,
 *         Category, Due Date, Estimated Hours, Resource Links, Instructions
 *
 * Requirements: 8.2, 8.3, 8.4
 */
import React, { useState, useEffect } from 'react';
import { Button } from './common';

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const EMPTY = {
  title: '',
  description: '',
  assignedTo: [],
  priority: 'Medium',
  category: '',
  dueDate: '',
  estimatedHours: '',
  resourceLinks: '',
  instructions: '',
};

function TaskForm({ initialData = null, activeInterns = [], onSubmit, onCancel, isLoading = false }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title ?? '',
        description: initialData.description ?? '',
        assignedTo: initialData.assignedTo ?? [],
        priority: initialData.priority ?? 'Medium',
        category: initialData.category ?? '',
        dueDate: initialData.dueDate ?? '',
        estimatedHours: initialData.estimatedHours ?? '',
        resourceLinks: initialData.resourceLinks ?? '',
        instructions: initialData.instructions ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function toggleAssignee(id) {
    setForm((prev) => {
      const set = new Set(prev.assignedTo);
      set.has(id) ? set.delete(id) : set.add(id);
      return { ...prev, assignedTo: [...set] };
    });
    if (errors.assignedTo) setErrors((prev) => ({ ...prev, assignedTo: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.assignedTo.length) errs.assignedTo = 'Assign to at least one intern.';
    if (!form.priority) errs.priority = 'Priority is required.';
    if (!form.dueDate) errs.dueDate = 'Due Date is required.';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({
      ...form,
      title: form.title.trim(),
      estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
    });
  }

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${
      errors[field] ? 'border-danger' : 'border-border'
    }`;
  const labelClass = 'block text-xs font-medium text-textSecondary mb-1';
  const errClass = 'text-xs text-danger mt-1';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1">
        {/* Title */}
        <div className="sm:col-span-2">
          <label htmlFor="tf-title" className={labelClass}>Title <span className="text-danger">*</span></label>
          <input id="tf-title" name="title" type="text" value={form.title} onChange={handleChange} className={inputClass('title')} aria-required="true" />
          {errors.title && <p className={errClass}>{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="tf-desc" className={labelClass}>Description</label>
          <textarea id="tf-desc" name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass('description')} />
        </div>

        {/* Assigned To */}
        <div className="sm:col-span-2">
          <p className={labelClass}>Assigned To <span className="text-danger">*</span></p>
          {activeInterns.length === 0 ? (
            <p className="text-xs text-textSecondary">No active interns available.</p>
          ) : (
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg border-border max-h-32 overflow-y-auto">
              {activeInterns.map((intern) => (
                <label key={intern.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.assignedTo.includes(intern.id)}
                    onChange={() => toggleAssignee(intern.id)}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                  />
                  {intern.name}
                </label>
              ))}
            </div>
          )}
          {errors.assignedTo && <p className={errClass}>{errors.assignedTo}</p>}
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="tf-priority" className={labelClass}>Priority <span className="text-danger">*</span></label>
          <select id="tf-priority" name="priority" value={form.priority} onChange={handleChange} className={inputClass('priority')} aria-required="true">
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="tf-category" className={labelClass}>Category</label>
          <input id="tf-category" name="category" type="text" value={form.category} onChange={handleChange} className={inputClass('category')} />
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="tf-dueDate" className={labelClass}>Due Date <span className="text-danger">*</span></label>
          <input id="tf-dueDate" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className={inputClass('dueDate')} aria-required="true" />
          {errors.dueDate && <p className={errClass}>{errors.dueDate}</p>}
        </div>

        {/* Estimated Hours */}
        <div>
          <label htmlFor="tf-hours" className={labelClass}>Estimated Hours</label>
          <input id="tf-hours" name="estimatedHours" type="number" min="0" step="0.5" value={form.estimatedHours} onChange={handleChange} className={inputClass('estimatedHours')} />
        </div>

        {/* Resource Links */}
        <div className="sm:col-span-2">
          <label htmlFor="tf-links" className={labelClass}>Resource Links</label>
          <input id="tf-links" name="resourceLinks" type="text" value={form.resourceLinks} onChange={handleChange} className={inputClass('resourceLinks')} placeholder="Comma-separated URLs…" />
        </div>

        {/* Instructions */}
        <div className="sm:col-span-2">
          <label htmlFor="tf-instructions" className={labelClass}>Instructions</label>
          <textarea id="tf-instructions" name="instructions" value={form.instructions} onChange={handleChange} rows={3} className={inputClass('instructions')} />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving…' : initialData ? 'Update Task' : 'Assign Task'}
        </Button>
      </div>
    </form>
  );
}

export default TaskForm;
