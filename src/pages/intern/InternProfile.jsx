/**
 * InternProfile — Intern profile page.
 *
 * Read-only fields: Name, Email, Department, Start/End Date, Mentor, College, Stipend, Status
 * Editable fields: Phone, Emergency Contact, Address, LinkedIn URL
 * Profile completion progress bar
 *
 * Requirements: 14.1–14.4
 */
import React, { useEffect, useState, useMemo } from 'react';
import useAuthStore from '../../store/authStore';
import useInternStore from '../../store/internStore';
import { useToast } from '../../hooks/useToast';
import { Button, Avatar, StatusBadge } from '../../components/common';
import { formatDate } from '../../utils/dateUtils';

const OPTIONAL_FIELDS = ['phone', 'emergencyContact', 'address', 'linkedinUrl', 'photoUrl'];

function InternProfile() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { interns, loadInterns, updateIntern } = useInternStore();
  const { showToast } = useToast();

  const [form, setForm] = useState({ phone: '', emergencyContact: '', address: '', linkedinUrl: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadInterns(); }, []);

  // Find the full intern record (has all fields)
  const intern = useMemo(
    () => interns.find((i) => i.id === currentUser?.id) ?? currentUser,
    [interns, currentUser]
  );

  useEffect(() => {
    if (intern) {
      setForm({
        phone: intern.phone ?? '',
        emergencyContact: intern.emergencyContact ?? '',
        address: intern.address ?? '',
        linkedinUrl: intern.linkedinUrl ?? '',
      });
    }
  }, [intern]);

  // Profile completion %
  const completionPct = useMemo(() => {
    if (!intern) return 0;
    const filled = OPTIONAL_FIELDS.filter((f) => intern[f] && String(intern[f]).trim()).length;
    return Math.round((filled / OPTIONAL_FIELDS.length) * 100);
  }, [intern]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.phone.trim()) errs.phone = 'Phone is required.';
    return errs;
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    updateIntern(intern.id, form);
    showToast('Profile updated successfully.', 'success');
    setSaving(false);
  }

  if (!intern) return <p className="text-textSecondary">Loading…</p>;

  const readOnlyFields = [
    ['Registration No.', intern.regNumber || '—'],
    ['Full Name', intern.name],
    ['Email', intern.email],
    ['Department', intern.department],
    ['Status', intern.status],
    ['Start Date', intern.startDate ? formatDate(intern.startDate) : '—'],
    ['End Date', intern.endDate ? formatDate(intern.endDate) : '—'],
    ['Mentor', intern.mentor || '—'],
    ['College', intern.college || '—'],
    ['Stipend', intern.stipend ? `₹${intern.stipend}/month` : '—'],
    ['Internship Type', intern.internshipType || '—'],
  ];

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${
      errors[field] ? 'border-danger' : 'border-border'
    }`;

  return (
    <section aria-label="My Profile">
      <h1 className="text-2xl font-bold text-textPrimary mb-6">My Profile</h1>

      {/* Profile header */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-5 mb-5">
          <Avatar name={intern.name} photoUrl={intern.photoUrl} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-textPrimary">{intern.name}</h2>
            <p className="text-textSecondary text-sm">{intern.department}</p>
            <StatusBadge status={intern.status} className="mt-1" />
          </div>
        </div>

        {/* Profile completion */}
        <div>
          <div className="flex justify-between text-xs text-textSecondary mb-1">
            <span>Profile Completion</span>
            <span>{completionPct}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${completionPct}%` }}
              role="progressbar"
              aria-valuenow={completionPct}
              aria-valuemax={100}
              aria-label={`Profile ${completionPct}% complete`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Read-only info */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-base font-semibold text-textPrimary mb-4">Profile Information</h3>
          <dl className="space-y-3">
            {readOnlyFields.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-xs text-textSecondary shrink-0">{label}</dt>
                <dd className="text-sm font-medium text-textPrimary text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Editable fields */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-base font-semibold text-textPrimary mb-4">Edit Contact Info</h3>
          <form onSubmit={handleSave} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="ip-phone" className="block text-xs font-medium text-textSecondary mb-1">
                  Phone <span className="text-danger">*</span>
                </label>
                <input
                  id="ip-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass('phone')}
                  aria-required="true"
                />
                {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="ip-emergency" className="block text-xs font-medium text-textSecondary mb-1">
                  Emergency Contact
                </label>
                <input
                  id="ip-emergency"
                  name="emergencyContact"
                  type="text"
                  value={form.emergencyContact}
                  onChange={handleChange}
                  className={inputClass('emergencyContact')}
                />
              </div>

              <div>
                <label htmlFor="ip-address" className="block text-xs font-medium text-textSecondary mb-1">
                  Address
                </label>
                <textarea
                  id="ip-address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass('address')}
                />
              </div>

              <div>
                <label htmlFor="ip-linkedin" className="block text-xs font-medium text-textSecondary mb-1">
                  LinkedIn URL
                </label>
                <input
                  id="ip-linkedin"
                  name="linkedinUrl"
                  type="url"
                  value={form.linkedinUrl}
                  onChange={handleChange}
                  className={inputClass('linkedinUrl')}
                  placeholder="https://linkedin.com/in/…"
                />
              </div>
            </div>

            <div className="mt-5">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default InternProfile;
