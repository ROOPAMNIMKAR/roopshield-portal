/**
 * CredentialsManager — Admin page to view and manage all user credentials.
 * Shows all users (admin, HR, interns) with their login email and password.
 * Admin can update any user's password directly from here.
 * Supports Excel and CSV export of all user data.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { credentialsApi } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Button, Modal } from '../../components/common';

const ROLE_COLORS = {
  admin:  'bg-purple-100 text-purple-700',
  hr:     'bg-blue-100 text-blue-700',
  intern: 'bg-green-100 text-green-700',
};

const STATUS_COLORS = {
  Active:    'bg-green-100 text-green-700',
  Inactive:  'bg-gray-100 text-gray-500',
  Completed: 'bg-blue-100 text-blue-700',
};

// ── SpreadsheetML Excel export helper ─────────────────────────────────────────
function exportExcel(data, filename) {
  if (!data || data.length === 0) return;
  const cols = Object.keys(data[0]);
  let xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Sheet1"><Table>`;
  xml += '<Row>' + cols.map((c) => `<Cell><Data ss:Type="String">${c}</Data></Cell>`).join('') + '</Row>';
  data.forEach((row) => {
    xml += '<Row>' + cols.map((c) => `<Cell><Data ss:Type="String">${String(row[c] ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>`).join('') + '</Row>';
  });
  xml += '</Table></Worksheet></Workbook>';
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function CredentialsManager() {
  const { showToast } = useToast();

  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showPwd, setShowPwd]       = useState({});

  const [editUser, setEditUser]     = useState(null);
  const [newPwd, setNewPwd]         = useState('');
  const [pwdError, setPwdError]     = useState('');
  const [saving, setSaving]         = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await credentialsApi.getAll();
      setUsers(data);
    } catch (err) {
      showToast('Failed to load credentials: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchSearch = !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q) ||
        u.regNumber?.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [users, search, roleFilter]);

  function copyText(text, label) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(`${label} copied.`, 'success'))
      .catch(() => showToast('Copy failed — please copy manually.', 'error'));
  }

  function copyAll(user) {
    const text = [
      `Name     : ${user.name}`,
      `Role     : ${user.role}`,
      user.regNumber ? `Reg No   : ${user.regNumber}` : null,
      `Email    : ${user.email}`,
      `Password : ${user.plainPassword || '(not set)'}`,
    ].filter(Boolean).join('\n');
    copyText(text, 'Credentials');
  }

  async function handleSavePassword(e) {
    e.preventDefault();
    if (!newPwd || newPwd.length < 6) { setPwdError('Password must be at least 6 characters.'); return; }
    setSaving(true);
    try {
      const result = await credentialsApi.updatePassword(editUser.id, newPwd);
      setUsers((prev) => prev.map((u) => u.id === editUser.id ? { ...u, plainPassword: result.plainPassword } : u));
      showToast(`Password updated for ${editUser.name}.`, 'success');
      setEditUser(null); setNewPwd(''); setPwdError('');
    } catch (err) {
      setPwdError(err.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate(user) {
    try {
      const result = await credentialsApi.generatePassword(user.id);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, plainPassword: result.plainPassword } : u));
      setShowPwd((prev) => ({ ...prev, [user.id]: true }));
      showToast(`New password for ${user.name}: ${result.plainPassword}`, 'success');
    } catch (err) {
      showToast('Failed to generate password: ' + err.message, 'error');
    }
  }

  // ── CSV export ───────────────────────────────────────────────────────────────
  function exportCSV() {
    const rows = [
      ['#', 'Reg No', 'Name', 'Role', 'Department', 'Email', 'Password', 'Status'],
      ...filtered.map((u, i) => [i + 1, u.regNumber || '', u.name, u.role, u.department || '', u.email, u.plainPassword || '', u.status || '']),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'roopshield-credentials.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported.', 'success');
  }

  // ── Excel: ALL users ─────────────────────────────────────────────────────────
  function exportAllUsersExcel() {
    const data = users.map((u, i) => ({
      '#': i + 1,
      'Reg No': u.regNumber || '',
      'Name': u.name || '',
      'Role': u.role || '',
      'Department': u.department || '',
      'College': u.college || '',
      'Phone': u.phone || '',
      'Email': u.email || '',
      'Password': u.plainPassword || '',
      'Status': u.status || '',
      'Skills': Array.isArray(u.skills) ? u.skills.join(', ') : (u.skills || ''),
      'Start Date': u.startDate || '',
      'End Date': u.endDate || '',
    }));
    exportExcel(data, 'roopshield-all-users.xls');
    showToast('All users Excel downloaded.', 'success');
  }

  // ── Excel: Interns only ──────────────────────────────────────────────────────
  function exportInternsExcel() {
    const internUsers = users.filter((u) => u.role === 'intern');
    const data = internUsers.map((u) => ({
      'Reg No': u.regNumber || '',
      'Name': u.name || '',
      'Email': u.email || '',
      'Phone': u.phone || '',
      'Department': u.department || '',
      'College': u.college || '',
      'Education': u.education || '',
      'Skills': Array.isArray(u.skills) ? u.skills.join(', ') : (u.skills || ''),
      'Start Date': u.startDate || '',
      'End Date': u.endDate || '',
      'Status': u.status || '',
      'Password': u.plainPassword || '',
    }));
    exportExcel(data, 'roopshield-interns.xls');
    showToast('Interns Excel downloaded.', 'success');
  }

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    hr: users.filter((u) => u.role === 'hr').length,
    intern: users.filter((u) => u.role === 'intern').length,
  };

  return (
    <section aria-label="Credentials Manager">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Credentials Manager</h1>
          <p className="text-sm text-textSecondary mt-0.5">View and manage login credentials for all users</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" onClick={exportCSV} className="text-xs">
            📄 Export CSV
          </Button>
          <button
            type="button"
            onClick={exportAllUsersExcel}
            className="inline-flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            📊 Download Excel (All)
          </button>
          <button
            type="button"
            onClick={exportInternsExcel}
            className="inline-flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            📊 Interns Excel
          </button>
        </div>
      </div>

      {/* Role filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'all', label: 'All Users' },
          { key: 'intern', label: 'Interns' },
          { key: 'hr', label: 'HR' },
          { key: 'admin', label: 'Admin' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRoleFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
              roleFilter === key ? 'bg-accent text-white' : 'bg-white border border-border text-textSecondary hover:text-textPrimary'
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${roleFilter === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, department…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">#</th>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Reg / ID</th>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Role</th>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Department</th>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Login Email</th>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Password</th>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Status</th>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-textSecondary">No users found.</td></tr>
              ) : (
                filtered.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-textSecondary text-xs">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {user.regNumber
                        ? <span className="font-mono text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded">{user.regNumber}</span>
                        : <span className="text-xs text-textSecondary">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 font-medium text-textPrimary whitespace-nowrap">{user.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-textSecondary text-xs">{user.department || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-textPrimary">{user.email}</span>
                        <button type="button" onClick={() => copyText(user.email, 'Email')} className="text-textSecondary hover:text-accent focus:outline-none shrink-0" title="Copy email">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-textPrimary">
                          {user.plainPassword
                            ? (showPwd[user.id] ? user.plainPassword : '••••••••')
                            : <span className="text-textSecondary italic">not set</span>
                          }
                        </span>
                        {user.plainPassword && (
                          <>
                            <button type="button" onClick={() => setShowPwd((p) => ({ ...p, [user.id]: !p[user.id] }))} className="text-textSecondary hover:text-accent focus:outline-none shrink-0" title={showPwd[user.id] ? 'Hide' : 'Show'}>
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {showPwd[user.id]
                                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                                  : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                                }
                              </svg>
                            </button>
                            <button type="button" onClick={() => copyText(user.plainPassword, 'Password')} className="text-textSecondary hover:text-accent focus:outline-none shrink-0" title="Copy password">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[user.status] || 'bg-gray-100 text-gray-500'}`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => copyAll(user)} className="p-1.5 rounded text-textSecondary hover:text-accent hover:bg-gray-100 focus:outline-none" title="Copy all credentials">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </button>
                        <button type="button" onClick={() => { setEditUser(user); setNewPwd(''); setPwdError(''); setShowNewPwd(false); }} className="p-1.5 rounded text-textSecondary hover:text-accent hover:bg-gray-100 focus:outline-none" title="Set password">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                        </button>
                        <button type="button" onClick={() => handleGenerate(user)} className="p-1.5 rounded text-textSecondary hover:text-green-600 hover:bg-green-50 focus:outline-none" title="Auto-generate new password">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-textSecondary mt-3">
        Showing {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
      </p>

      {/* Set Password Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Set Password — ${editUser?.name ?? ''}`} size="sm">
        <form onSubmit={handleSavePassword} noValidate className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <p><span className="text-textSecondary">Email:</span> <span className="font-mono font-medium">{editUser?.email}</span></p>
            {editUser?.plainPassword && (
              <p><span className="text-textSecondary">Current:</span> <span className="font-mono">{editUser.plainPassword}</span></p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-textSecondary mb-1">New Password <span className="text-danger">*</span></label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPwd}
                  onChange={(e) => { setNewPwd(e.target.value); setPwdError(''); }}
                  placeholder="Min 6 characters"
                  className={`w-full border rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${pwdError ? 'border-danger' : 'border-border'}`}
                />
                <button type="button" onClick={() => setShowNewPwd((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-textSecondary hover:text-accent">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showNewPwd
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
              <Button type="button" variant="ghost" className="shrink-0 text-xs px-3"
                onClick={() => { const fn = (editUser?.name || 'User').split(' ')[0]; setNewPwd(`${fn}@${Math.floor(1000 + Math.random() * 9000)}`); setShowNewPwd(true); setPwdError(''); }}>
                Generate
              </Button>
            </div>
            {pwdError && <p className="text-xs text-danger mt-1">{pwdError}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setEditUser(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Password'}</Button>
          </div>
        </form>
      </Modal>

    </section>
  );
}

export default CredentialsManager;
