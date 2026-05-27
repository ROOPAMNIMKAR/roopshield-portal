import React, { useState } from 'react';
import useInternStore from '../../store/internStore';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/common';

/**
 * InternForm — create or edit an intern profile.
 *
 * Props:
 *   intern  — null for add mode; populated object for edit mode
 *   onClose — called to dismiss the form/modal (after save or cancel)
 *
 * Satisfies Requirements 5.2, 5.4, 5.5
 */
export function InternForm({ intern, onClose }) {
  const { addIntern, updateIntern } = useInternStore();
  const { showToast } = useToast();

  const isEditMode = Boolean(intern);

  const [form, setForm] = useState({
    name: intern?.name ?? '',
    email: intern?.email ?? '',
    phone: intern?.phone ?? '',
    department: intern?.department ?? '',
    startDate: intern?.startDate ?? '',
    endDate: intern?.endDate ?? '',
    internshipType: intern?.internshipType ?? 'Full-time',
    mentor: intern?.mentor ?? '',
    college: intern?.college ?? '',
    stipend: intern?.stipend ?? '',
    photoUrl: intern?.photoUrl ?? '',
    status: intern?.status ?? 'Active',
  });

  const [errors, setErrors] = useState({});

  // ── Validation ────────────────────────────────────────────────────────────

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email.trim()) {
      e.email = 'Email is required.';
    } else if (!EMAIL_RE.test(form.email.trim())) {
      e.email = 'Enter a valid email address.';
    }
    if (!form.department.trim()) e.department = 'Department is required.';
    if (!form.startDate) e.startDate = 'Start date is required.';
    if (!form.endDate) {
      e.endDate = 'End date is required.';
    } else if (form.startDate && form.endDate <= form.startDate) {
      e.endDate = 'End date must be after start date.';
    }
    return e;
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...form,
      stipend: form.stipend !== '' ? Number(form.stipend) : null,
    };

    if (isEditMode) {
      updateIntern(intern.id, payload);
      showToast('Intern updated successfully.', 'success');
    } else {
      addIntern(payload);
      showToast('Intern added successfully.', 'success');
    }

    onClose();
  }

  // ── Style helpers ─────────────────────────────────────────────────────────

  const inputBase =
    'w-full border rounded-lg px-3 py-2 text-sm text-textPrimary bg-white ' +
    'focus:outline-none focus:ring-2 focus:ring-accent placeholder-textSecondary transition-colors';

  function inputClass(field) {
    return `${inputBase} ${errors[field] ? 'border-danger' : 'border-border'}`;
  }

  const labelClass = 'block text-xs font-medium text-textSecondary mb-1';
  const errorClass = 'mt-1 text-xs text-danger';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} noValidate aria-label={isEditMode ? 'Edit intern form' : 'Add intern form'}>
      {/* Scrollable body */}
      <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-4">

        {/* Row 1: Full Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="if-name" className={labelClass}>
              Full Name <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id="if-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Verma"
              className={inputClass('name')}
              aria-required="true"
              aria-describedby={errors.name ? 'if-name-error' : undefined}
            />
            {errors.name && (
              <p id="if-name-error" className={errorClass} role="alert">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="if-email" className={labelClass}>
              Email <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id="if-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="rahul@example.com"
              className={inputClass('email')}
              aria-required="true"
              aria-describedby={errors.email ? 'if-email-error' : undefined}
            />
            {errors.email && (
              <p id="if-email-error" className={errorClass} role="alert">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Row 2: Phone + Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="if-phone" className={labelClass}>Phone</label>
            <input
              id="if-phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className={inputClass('phone')}
            />
          </div>

          <div>
            <label htmlFor="if-department" className={labelClass}>
              Department <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id="if-department"
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. Engineering"
              className={inputClass('department')}
              aria-required="true"
              aria-describedby={errors.department ? 'if-department-error' : undefined}
            />
            {errors.department && (
              <p id="if-department-error" className={errorClass} role="alert">{errors.department}</p>
            )}
          </div>
        </div>

        {/* Row 3: Start Date + End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="if-startDate" className={labelClass}>
              Start Date <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id="if-startDate"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className={inputClass('startDate')}
              aria-required="true"
              aria-describedby={errors.startDate ? 'if-startDate-error' : undefined}
            />
            {errors.startDate && (
              <p id="if-startDate-error" className={errorClass} role="alert">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="if-endDate" className={labelClass}>
              End Date <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id="if-endDate"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className={inputClass('endDate')}
              aria-required="true"
              aria-describedby={errors.endDate ? 'if-endDate-error' : undefined}
            />
            {errors.endDate && (
              <p id="if-endDate-error" className={errorClass} role="alert">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Row 4: Internship Type + Mentor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="if-internshipType" className={labelClass}>Internship Type</label>
            <select
              id="if-internshipType"
              name="internshipType"
              value={form.internshipType}
              onChange={handleChange}
              className={inputClass('internshipType')}
              aria-label="Internship type"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div>
            <label htmlFor="if-mentor" className={labelClass}>Mentor</label>
            <input
              id="if-mentor"
              type="text"
              name="mentor"
              value={form.mentor}
              onChange={handleChange}
              placeholder="Mentor name"
              className={inputClass('mentor')}
            />
          </div>
        </div>

        {/* Row 5: College + Stipend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="if-college" className={labelClass}>College</label>
            <input
              id="if-college"
              type="text"
              name="college"
              value={form.college}
              onChange={handleChange}
              placeholder="College / University"
              className={inputClass('college')}
            />
          </div>

          <div>
            <label htmlFor="if-stipend" className={labelClass}>Stipend (₹)</label>
            <input
              id="if-stipend"
              type="number"
              name="stipend"
              value={form.stipend}
              onChange={handleChange}
              placeholder="e.g. 10000"
              min="0"
              className={inputClass('stipend')}
            />
          </div>
        </div>

        {/* Row 6: Photo URL */}
        <div>
          <label htmlFor="if-photoUrl" className={labelClass}>Photo URL</label>
          <input
            id="if-photoUrl"
            type="text"
            name="photoUrl"
            value={form.photoUrl}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
            className={inputClass('photoUrl')}
          />
        </div>

        {/* Row 7: Status */}
        <div>
          <label htmlFor="if-status" className={labelClass}>Status</label>
          <select
            id="if-status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass('status')}
            aria-label="Intern status"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          aria-label="Cancel and close form"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          aria-label={isEditMode ? 'Save changes to intern' : 'Add new intern'}
        >
          {isEditMode ? 'Save Changes' : 'Add Intern'}
        </Button>
      </div>
    </form>
  );
}

export default InternForm;
