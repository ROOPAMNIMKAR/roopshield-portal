/**
 * InternForm — Add/Edit intern modal form with validation.
 *
 * Fields: Full Name, Email, Phone, Department, Start Date, End Date,
 *         Internship Type, Mentor, College, Stipend, Photo URL, Status
 *
 * Validation:
 *   - Required: Full Name, Email (valid format), Phone, Department, Start Date, End Date, Status
 *   - End Date must be after Start Date
 *
 * Requirements: 5.2, 5.4, 5.5
 */
import React, { useState, useEffect } from 'react';
import { Button } from './common';
import useDepartmentStore from '../store/departmentStore';

const STATUSES = ['Active', 'Inactive', 'Completed'];
const INTERNSHIP_TYPES = ['Full-time', 'Part-time', 'Remote', 'Hybrid'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_FORM = {
  name: '', email: '', phone: '', department: '',
  startDate: '', endDate: '', internshipType: '',
  mentor: '', college: '', stipend: '', photoUrl: '', status: 'Active',
};

/**
 * @param {{
 *   initialData?: object,
 *   onSubmit: (data: object) => void,
 *   onCancel: () => void,
 *   isLoading?: boolean,
 * }} props
 */
function InternForm({ initialData = null, onSubmit, onCancel, isLoading = false }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const { departments, loadDepartments } = useDepartmentStore();

  useEffect(() => { loadDepartments(); }, []);

  // Pre-populate when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? '',
        email: initialData.email ?? '',
        phone: initialData.phone ?? '',
        department: initialData.department ?? '',
        startDate: initialData.startDate ?? '',
        endDate: initialData.endDate ?? '',
        internshipType: initialData.internshipType ?? '',
        mentor: initialData.mentor ?? '',
        college: initialData.college ?? '',
        stipend: initialData.stipend ?? '',
        photoUrl: initialData.photoUrl ?? '',
        status: initialData.status ?? 'Active',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full Name is required.';
    if (!form.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!EMAIL_RE.test(form.email.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    if (!form.phone.trim()) errs.phone = 'Phone is required.';
    if (!form.department) errs.department = 'Department is required.';
    if (!form.startDate) errs.startDate = 'Start Date is required.';
    if (!form.endDate) {
      errs.endDate = 'End Date is required.';
    } else if (form.startDate && form.endDate <= form.startDate) {
      errs.endDate = 'End Date must be after Start Date.';
    }
    if (!form.status) errs.status = 'Status is required.';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      stipend: form.stipend ? Number(form.stipend) : undefined,
    });
  }

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${
      errors[field]
        ? 'border-danger focus:ring-danger'
        : 'border-border focus:border-accent'
    }`;

  const labelClass = 'block text-xs font-medium text-textSecondary mb-1';
  const errorClass = 'text-xs text-danger mt-1';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1">
        {/* Full Name */}
        <div>
          <label htmlFor="if-name" className={labelClass}>
            Full Name <span className="text-danger">*</span>
          </label>
          <input
            id="if-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className={inputClass('name')}
            autoComplete="name"
            aria-required="true"
            aria-describedby={errors.name ? 'if-name-err' : undefined}
          />
          {errors.name && <p id="if-name-err" className={errorClass}>{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="if-email" className={labelClass}>
            Email <span className="text-danger">*</span>
          </label>
          <input
            id="if-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass('email')}
            autoComplete="email"
            aria-required="true"
            aria-describedby={errors.email ? 'if-email-err' : undefined}
          />
          {errors.email && <p id="if-email-err" className={errorClass}>{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="if-phone" className={labelClass}>
            Phone <span className="text-danger">*</span>
          </label>
          <input
            id="if-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className={inputClass('phone')}
            autoComplete="tel"
            aria-required="true"
            aria-describedby={errors.phone ? 'if-phone-err' : undefined}
          />
          {errors.phone && <p id="if-phone-err" className={errorClass}>{errors.phone}</p>}
        </div>

        {/* Department */}
        <div>
          <label htmlFor="if-department" className={labelClass}>
            Department <span className="text-danger">*</span>
          </label>
          <select
            id="if-department"
            name="department"
            value={form.department}
            onChange={handleChange}
            className={inputClass('department')}
            aria-required="true"
            aria-describedby={errors.department ? 'if-dept-err' : undefined}
          >
            <option value="">Select department…</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.department && <p id="if-dept-err" className={errorClass}>{errors.department}</p>}
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="if-startDate" className={labelClass}>
            Start Date <span className="text-danger">*</span>
          </label>
          <input
            id="if-startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            className={inputClass('startDate')}
            aria-required="true"
            aria-describedby={errors.startDate ? 'if-start-err' : undefined}
          />
          {errors.startDate && <p id="if-start-err" className={errorClass}>{errors.startDate}</p>}
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="if-endDate" className={labelClass}>
            End Date <span className="text-danger">*</span>
          </label>
          <input
            id="if-endDate"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            className={inputClass('endDate')}
            aria-required="true"
            aria-describedby={errors.endDate ? 'if-end-err' : undefined}
          />
          {errors.endDate && <p id="if-end-err" className={errorClass}>{errors.endDate}</p>}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="if-status" className={labelClass}>
            Status <span className="text-danger">*</span>
          </label>
          <select
            id="if-status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass('status')}
            aria-required="true"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Internship Type */}
        <div>
          <label htmlFor="if-internshipType" className={labelClass}>Internship Type</label>
          <select
            id="if-internshipType"
            name="internshipType"
            value={form.internshipType}
            onChange={handleChange}
            className={inputClass('internshipType')}
          >
            <option value="">Select type…</option>
            {INTERNSHIP_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Mentor */}
        <div>
          <label htmlFor="if-mentor" className={labelClass}>Mentor</label>
          <input
            id="if-mentor"
            name="mentor"
            type="text"
            value={form.mentor}
            onChange={handleChange}
            className={inputClass('mentor')}
          />
        </div>

        {/* College */}
        <div>
          <label htmlFor="if-college" className={labelClass}>College</label>
          <input
            id="if-college"
            name="college"
            type="text"
            value={form.college}
            onChange={handleChange}
            className={inputClass('college')}
          />
        </div>

        {/* Stipend */}
        <div>
          <label htmlFor="if-stipend" className={labelClass}>Stipend (₹/month)</label>
          <input
            id="if-stipend"
            name="stipend"
            type="number"
            min="0"
            value={form.stipend}
            onChange={handleChange}
            className={inputClass('stipend')}
          />
        </div>

        {/* Photo URL */}
        <div>
          <label htmlFor="if-photoUrl" className={labelClass}>Photo URL</label>
          <input
            id="if-photoUrl"
            name="photoUrl"
            type="url"
            value={form.photoUrl}
            onChange={handleChange}
            className={inputClass('photoUrl')}
            placeholder="https://…"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Saving…' : initialData ? 'Update Intern' : 'Add Intern'}
        </Button>
      </div>
    </form>
  );
}

export default InternForm;
