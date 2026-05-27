/**
 * AdminProfile — Admin can view and edit their own account details.
 *
 * Sections:
 *   1. Profile info  — Name, display photo
 *   2. Account       — Email (login ID)
 *   3. Password      — Change password with current-password verification
 *   4. Danger zone   — (informational only)
 */
import React, { useEffect, useState, useMemo } from 'react';
import useAuthStore from '../../store/authStore';
import { readStorage, writeStorage } from '../../services/storage';
import { useToast } from '../../hooks/useToast';
import { Button, Avatar } from '../../components/common';

const USERS_KEY = 'roopshield_users';

function AdminProfile() {
  const currentUser  = useAuthStore((s) => s.currentUser);
  const { showToast } = useToast();

  // ── Load full admin record from localStorage ──
  const [adminRecord, setAdminRecord] = useState(null);

  function loadAdmin() {
    const users = readStorage(USERS_KEY, []);
    const found = users.find((u) => u.id === currentUser?.id);
    setAdminRecord(found ?? currentUser);
  }

  useEffect(() => { loadAdmin(); }, [currentUser]);

  // ── Profile form ──
  const [profileForm, setProfileForm] = useState({ name: '', photoUrl: '' });
  const [profileErrors, setProfileErrors] = useState({});

  // ── Email form ──
  const [emailForm, setEmailForm] = useState({ email: '', currentPassword: '' });
  const [emailErrors, setEmailErrors] = useState({});

  // ── Password form ──
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  // Populate forms when record loads
  useEffect(() => {
    if (adminRecord) {
      setProfileForm({ name: adminRecord.name ?? '', photoUrl: adminRecord.photoUrl ?? '' });
      setEmailForm((p) => ({ ...p, email: adminRecord.email ?? '' }));
    }
  }, [adminRecord]);

  // ── Helper: save updated admin to localStorage + session ──
  function saveAdmin(updates) {
    const users = readStorage(USERS_KEY, []);
    const updated = users.map((u) =>
      u.id === currentUser.id ? { ...u, ...updates } : u
    );
    writeStorage(USERS_KEY, updated);

    // Update sessionStorage so TopBar reflects new name immediately
    try {
      const raw = sessionStorage.getItem('roopshield_session');
      if (raw) {
        const session = JSON.parse(raw);
        sessionStorage.setItem('roopshield_session', JSON.stringify({ ...session, ...updates }));
      }
    } catch { /* ignore */ }

    // Update Zustand store
    useAuthStore.setState((s) => ({
      currentUser: s.currentUser ? { ...s.currentUser, ...updates } : s.currentUser,
    }));

    loadAdmin();
  }

  // ── Save profile ──
  function handleProfileSave(e) {
    e.preventDefault();
    const errs = {};
    if (!profileForm.name.trim()) errs.name = 'Name is required.';
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }
    saveAdmin({ name: profileForm.name.trim(), photoUrl: profileForm.photoUrl.trim() });
    showToast('Profile updated.', 'success');
    setProfileErrors({});
  }

  // ── Save email ──
  function handleEmailSave(e) {
    e.preventDefault();
    const errs = {};
    if (!emailForm.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email.trim())) errs.email = 'Invalid email format.';
    if (!emailForm.currentPassword) errs.currentPassword = 'Enter your current password to confirm.';
    else if (emailForm.currentPassword !== adminRecord?.password) errs.currentPassword = 'Current password is incorrect.';

    // Check duplicate email (excluding self)
    const users = readStorage(USERS_KEY, []);
    if (!errs.email && users.some((u) => u.email === emailForm.email.trim() && u.id !== currentUser.id)) {
      errs.email = 'This email is already in use.';
    }

    if (Object.keys(errs).length) { setEmailErrors(errs); return; }
    saveAdmin({ email: emailForm.email.trim() });
    setEmailForm((p) => ({ ...p, currentPassword: '' }));
    showToast('Email updated. Use your new email to log in next time.', 'success');
    setEmailErrors({});
  }

  // ── Change password ──
  function handlePasswordSave(e) {
    e.preventDefault();
    const errs = {};
    if (!pwdForm.currentPassword) errs.currentPassword = 'Enter your current password.';
    else if (pwdForm.currentPassword !== adminRecord?.password) errs.currentPassword = 'Current password is incorrect.';
    if (!pwdForm.newPassword) errs.newPassword = 'New password is required.';
    else if (pwdForm.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters.';
    if (!pwdForm.confirmPassword) errs.confirmPassword = 'Please confirm your new password.';
    else if (pwdForm.newPassword !== pwdForm.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (pwdForm.newPassword && pwdForm.newPassword === pwdForm.currentPassword) errs.newPassword = 'New password must be different from current password.';

    if (Object.keys(errs).length) { setPwdErrors(errs); return; }
    saveAdmin({ password: pwdForm.newPassword });
    setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showToast('Password changed successfully.', 'success');
    setPwdErrors({});
  }

  const inputClass = (field, errs) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${
      errs[field] ? 'border-danger' : 'border-border'
    }`;

  const labelClass = 'block text-xs font-medium text-textSecondary mb-1';
  const errClass   = 'text-xs text-danger mt-1';

  if (!adminRecord) return <p className="text-textSecondary p-6">Loading…</p>;

  return (
    <section aria-label="Admin Profile & Settings" className="max-w-2xl">
      <h1 className="text-2xl font-bold text-textPrimary mb-2">My Account</h1>
      <p className="text-sm text-textSecondary mb-8">Manage your profile, login email, and password.</p>

      {/* ── Current account summary ── */}
      <div className="bg-white rounded-xl border border-border p-5 mb-6 flex items-center gap-4">
        <Avatar name={adminRecord.name} photoUrl={adminRecord.photoUrl} size="xl" />
        <div>
          <p className="text-lg font-bold text-textPrimary">{adminRecord.name}</p>
          <p className="text-sm text-textSecondary">{adminRecord.email}</p>
          <span className="inline-block mt-1 text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">
            Admin
          </span>
        </div>
      </div>

      {/* ── Section 1: Profile Info ── */}
      <div className="bg-white rounded-xl border border-border p-6 mb-5">
        <h2 className="text-base font-semibold text-textPrimary mb-4 flex items-center gap-2">
          <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile Information
        </h2>
        <form onSubmit={handleProfileSave} noValidate className="space-y-4">
          <div>
            <label htmlFor="ap-name" className={labelClass}>
              Display Name <span className="text-danger">*</span>
            </label>
            <input
              id="ap-name"
              type="text"
              value={profileForm.name}
              onChange={(e) => { setProfileForm((p) => ({ ...p, name: e.target.value })); if (profileErrors.name) setProfileErrors({}); }}
              className={inputClass('name', profileErrors)}
              placeholder="Your full name"
            />
            {profileErrors.name && <p className={errClass}>{profileErrors.name}</p>}
          </div>
          <div>
            <label htmlFor="ap-photo" className={labelClass}>Photo URL</label>
            <input
              id="ap-photo"
              type="url"
              value={profileForm.photoUrl}
              onChange={(e) => setProfileForm((p) => ({ ...p, photoUrl: e.target.value }))}
              className={inputClass('photoUrl', profileErrors)}
              placeholder="https://example.com/photo.jpg"
            />
            <p className="text-xs text-textSecondary mt-1">Leave blank to use initials avatar.</p>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save Profile</Button>
          </div>
        </form>
      </div>

      {/* ── Section 2: Login Email ── */}
      <div className="bg-white rounded-xl border border-border p-6 mb-5">
        <h2 className="text-base font-semibold text-textPrimary mb-1 flex items-center gap-2">
          <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Login Email
        </h2>
        <p className="text-xs text-textSecondary mb-4">This is the email you use to sign in. Changing it takes effect on your next login.</p>
        <form onSubmit={handleEmailSave} noValidate className="space-y-4">
          <div>
            <label htmlFor="ap-email" className={labelClass}>
              New Email <span className="text-danger">*</span>
            </label>
            <input
              id="ap-email"
              type="email"
              value={emailForm.email}
              onChange={(e) => { setEmailForm((p) => ({ ...p, email: e.target.value })); if (emailErrors.email) setEmailErrors((p) => ({ ...p, email: '' })); }}
              className={inputClass('email', emailErrors)}
            />
            {emailErrors.email && <p className={errClass}>{emailErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="ap-email-pwd" className={labelClass}>
              Current Password (to confirm) <span className="text-danger">*</span>
            </label>
            <input
              id="ap-email-pwd"
              type="password"
              value={emailForm.currentPassword}
              onChange={(e) => { setEmailForm((p) => ({ ...p, currentPassword: e.target.value })); if (emailErrors.currentPassword) setEmailErrors((p) => ({ ...p, currentPassword: '' })); }}
              className={inputClass('currentPassword', emailErrors)}
              placeholder="Enter your current password"
            />
            {emailErrors.currentPassword && <p className={errClass}>{emailErrors.currentPassword}</p>}
          </div>
          <div className="flex justify-end">
            <Button type="submit">Update Email</Button>
          </div>
        </form>
      </div>

      {/* ── Section 3: Change Password ── */}
      <div className="bg-white rounded-xl border border-border p-6 mb-5">
        <h2 className="text-base font-semibold text-textPrimary mb-1 flex items-center gap-2">
          <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Change Password
        </h2>
        <p className="text-xs text-textSecondary mb-4">Choose a strong password with at least 6 characters.</p>
        <form onSubmit={handlePasswordSave} noValidate className="space-y-4">
          {/* Current password */}
          <div>
            <label htmlFor="ap-cur-pwd" className={labelClass}>
              Current Password <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                id="ap-cur-pwd"
                type={showPwd.current ? 'text' : 'password'}
                value={pwdForm.currentPassword}
                onChange={(e) => { setPwdForm((p) => ({ ...p, currentPassword: e.target.value })); if (pwdErrors.currentPassword) setPwdErrors((p) => ({ ...p, currentPassword: '' })); }}
                className={inputClass('currentPassword', pwdErrors) + ' pr-10'}
              />
              <button type="button" onClick={() => setShowPwd((p) => ({ ...p, current: !p.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-accent focus:outline-none"
                aria-label={showPwd.current ? 'Hide password' : 'Show password'}>
                <EyeIcon open={showPwd.current} />
              </button>
            </div>
            {pwdErrors.currentPassword && <p className={errClass}>{pwdErrors.currentPassword}</p>}
          </div>

          {/* New password */}
          <div>
            <label htmlFor="ap-new-pwd" className={labelClass}>
              New Password <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                id="ap-new-pwd"
                type={showPwd.new ? 'text' : 'password'}
                value={pwdForm.newPassword}
                onChange={(e) => { setPwdForm((p) => ({ ...p, newPassword: e.target.value })); if (pwdErrors.newPassword) setPwdErrors((p) => ({ ...p, newPassword: '' })); }}
                className={inputClass('newPassword', pwdErrors) + ' pr-10'}
                placeholder="Min 6 characters"
              />
              <button type="button" onClick={() => setShowPwd((p) => ({ ...p, new: !p.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-accent focus:outline-none"
                aria-label={showPwd.new ? 'Hide password' : 'Show password'}>
                <EyeIcon open={showPwd.new} />
              </button>
            </div>
            {pwdErrors.newPassword && <p className={errClass}>{pwdErrors.newPassword}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="ap-confirm-pwd" className={labelClass}>
              Confirm New Password <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                id="ap-confirm-pwd"
                type={showPwd.confirm ? 'text' : 'password'}
                value={pwdForm.confirmPassword}
                onChange={(e) => { setPwdForm((p) => ({ ...p, confirmPassword: e.target.value })); if (pwdErrors.confirmPassword) setPwdErrors((p) => ({ ...p, confirmPassword: '' })); }}
                className={inputClass('confirmPassword', pwdErrors) + ' pr-10'}
                placeholder="Re-enter new password"
              />
              <button type="button" onClick={() => setShowPwd((p) => ({ ...p, confirm: !p.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-accent focus:outline-none"
                aria-label={showPwd.confirm ? 'Hide password' : 'Show password'}>
                <EyeIcon open={showPwd.confirm} />
              </button>
            </div>
            {pwdErrors.confirmPassword && <p className={errClass}>{pwdErrors.confirmPassword}</p>}
          </div>

          <div className="flex justify-end">
            <Button type="submit">Change Password</Button>
          </div>
        </form>
      </div>

      {/* ── Section 4: Account Info ── */}
      <div className="bg-gray-50 rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-textSecondary mb-3">Account Details</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-textSecondary">Role</dt>
            <dd className="font-medium text-textPrimary capitalize">{adminRecord.role}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-textSecondary">Account ID</dt>
            <dd className="font-mono text-xs text-textSecondary">{adminRecord.id}</dd>
          </div>
          {adminRecord.createdAt && (
            <div className="flex justify-between">
              <dt className="text-textSecondary">Member since</dt>
              <dd className="text-textPrimary">{new Date(adminRecord.createdAt).toLocaleDateString()}</dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

export default AdminProfile;
