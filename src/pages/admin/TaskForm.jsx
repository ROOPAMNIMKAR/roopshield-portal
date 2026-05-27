import React, { useState } from 'react';
import useTaskStore from '../../store/taskStore';
import useInternStore from '../../store/internStore';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/common';

/**
 * TaskForm — create or edit a task.
 *
 * Props:
 *   task    — null for add mode, populated object for edit mode
 *   onClose — called after successful submit or cancel
 *
 * Requirements: 8.1–8.8
 */
function TaskForm({ task = null, onClose }) {
  const { addTask, updateTaskStatus } = useTaskStore();
  const { interns } = useInternStore();
  const { currentUser } = useAuthStore();
  const { showToast } = useToast();

  const isEdit = task !== null;

  // Only show active interns in the assignee list
  const activeInterns = interns.filter((i) => i.status === 'Active');

  const [form, setForm] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    assignedTo: task?.assignedTo ?? [],
    priority: task?.priority ?? '',
    category: task?.category ?? '',
    dueDate: task?.dueDate ?? '',
    estimatedHours: task?.estimatedHours ?? '',
    resourceLinks: task?.resourceLinks ? task.resourceLinks.join('\n') : '',
    instructions: task?.instructions ?? '',
    // Edit-only: status
    status: task?.status ?? 'To Do',
  });

  const [errors, setErrors] = useState({});

  // ── Helpers ──────────────────────────────────────────────────────────────

  const inputClass =
    'w-full border border-border rounded-lg px-3 py-2 text-sm text-textPrimary bg-white ' +
    'focus:outline-none focus:ring-2 focus:ring-accent placeholder-textSecondary';

  const errorClass = 'mt-1 text-xs text-danger';

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.priority) e.priority = 'Priority is required.';
    if (!form.dueDate) e.dueDate = 'Due date is required.';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleAssignedToChange(internId) {
    setForm((prev) => {
      const already = prev.assignedTo.includes(internId);
      return {
        ...prev,
        assignedTo: already
          ? prev.assignedTo.filter((id) => id !== internId)
          : [...prev.assignedTo, internId],
      };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const resourceLinks = form.resourceLinks
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (isEdit) {
      // In edit mode update the status (and actor) via updateTaskStatus
      if (form.status !== task.status) {
        updateTaskStatus(task.id, form.status, currentUser?.name ?? 'Admin');
      }
      showToast('Task updated successfully.', 'success');
    } else {
      const data = {
        title: form.title.trim(),
        description: form.description.trim(),
        assignedTo: form.assignedTo,
        priority: form.priority,
        category: form.category.trim(),
        dueDate: form.dueDate,
        estimatedHours: form.estimatedHours !== '' ? Number(form.estimatedHours) : null,
        resourceLinks,
        instructions: form.instructions.trim(),
        createdBy: currentUser?.name ?? 'Admin',
      };
      addTask(data);
      showToast('Task assigned successfully.', 'success');
    }

    onClose();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const STATUSES = ['To Do', 'In Progress', 'Under Review', 'Completed'];

  return (
    <form onSubmit={handleSubmit} noValidate aria-label={isEdit ? 'Edit task form' : 'Assign task form'}>
      {/* Scrollable body */}
      <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-4">

        {/* Row 1: Title + Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-medium text-textSecondary mb-1">
              Title <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Build login page"
              className={`${inputClass} ${errors.title ? 'border-danger' : ''}`}
              aria-required="true"
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className={errorClass} role="alert">{errors.title}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="task-priority" className="block text-xs font-medium text-textSecondary mb-1">
              Priority <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <select
              id="task-priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className={`${inputClass} ${errors.priority ? 'border-danger' : ''}`}
              aria-required="true"
              aria-describedby={errors.priority ? 'priority-error' : undefined}
            >
              <option value="">Select priority…</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            {errors.priority && (
              <p id="priority-error" className={errorClass} role="alert">{errors.priority}</p>
            )}
          </div>
        </div>

        {/* Row 2: Category + Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label htmlFor="task-category" className="block text-xs font-medium text-textSecondary mb-1">
              Category
            </label>
            <input
              id="task-category"
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Frontend, Backend"
              className={inputClass}
              aria-label="Task category"
            />
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="task-due-date" className="block text-xs font-medium text-textSecondary mb-1">
              Due Date <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id="task-due-date"
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className={`${inputClass} ${errors.dueDate ? 'border-danger' : ''}`}
              aria-required="true"
              aria-describedby={errors.dueDate ? 'due-date-error' : undefined}
            />
            {errors.dueDate && (
              <p id="due-date-error" className={errorClass} role="alert">{errors.dueDate}</p>
            )}
          </div>
        </div>

        {/* Row 3: Estimated Hours + Status (edit only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Estimated Hours */}
          <div>
            <label htmlFor="task-estimated-hours" className="block text-xs font-medium text-textSecondary mb-1">
              Estimated Hours
            </label>
            <input
              id="task-estimated-hours"
              type="number"
              name="estimatedHours"
              value={form.estimatedHours}
              onChange={handleChange}
              placeholder="e.g. 8"
              min="0"
              step="0.5"
              className={inputClass}
              aria-label="Estimated hours to complete the task"
            />
          </div>

          {/* Status — only shown in edit mode */}
          {isEdit && (
            <div>
              <label htmlFor="task-status" className="block text-xs font-medium text-textSecondary mb-1">
                Status
              </label>
              <select
                id="task-status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass}
                aria-label="Task status"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="task-description" className="block text-xs font-medium text-textSecondary mb-1">
            Description
          </label>
          <textarea
            id="task-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe the task…"
            className={`${inputClass} resize-y`}
            aria-label="Task description"
          />
        </div>

        {/* Assigned To — multi-select via checkboxes */}
        <fieldset>
          <legend className="block text-xs font-medium text-textSecondary mb-2">
            Assigned To
          </legend>
          {activeInterns.length === 0 ? (
            <p className="text-xs text-textSecondary">No active interns available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-36 overflow-y-auto border border-border rounded-lg p-2">
              {activeInterns.map((intern) => (
                <label
                  key={intern.id}
                  className="flex items-center gap-2 text-sm text-textPrimary cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={form.assignedTo.includes(intern.id)}
                    onChange={() => handleAssignedToChange(intern.id)}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                    aria-label={`Assign to ${intern.name}`}
                  />
                  <span>{intern.name}</span>
                  {intern.department && (
                    <span className="text-xs text-textSecondary">({intern.department})</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        {/* Resource Links */}
        <div>
          <label htmlFor="task-resource-links" className="block text-xs font-medium text-textSecondary mb-1">
            Resource Links
            <span className="ml-1 font-normal text-textSecondary">(one per line)</span>
          </label>
          <textarea
            id="task-resource-links"
            name="resourceLinks"
            value={form.resourceLinks}
            onChange={handleChange}
            rows={3}
            placeholder="https://docs.example.com&#10;https://figma.com/file/..."
            className={`${inputClass} resize-y`}
            aria-label="Resource links, one URL per line"
          />
        </div>

        {/* Instructions */}
        <div>
          <label htmlFor="task-instructions" className="block text-xs font-medium text-textSecondary mb-1">
            Instructions
          </label>
          <textarea
            id="task-instructions"
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            rows={4}
            placeholder="Step-by-step instructions for the intern…"
            className={`${inputClass} resize-y`}
            aria-label="Task instructions"
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
        <Button type="button" variant="secondary" onClick={onClose} aria-label="Cancel and close form">
          Cancel
        </Button>
        <Button type="submit" variant="primary" aria-label={isEdit ? 'Save task changes' : 'Assign task'}>
          {isEdit ? 'Save Changes' : 'Assign Task'}
        </Button>
      </div>
    </form>
  );
}

export default TaskForm;
