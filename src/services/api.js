/**
 * services/api.js — HTTP client for the RoopShield backend API.
 *
 * All requests automatically attach the JWT token from sessionStorage.
 * On 401 responses the user is redirected to /login.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Token helpers ────────────────────────────────────────────────────────────

function getToken() {
  try {
    const raw = sessionStorage.getItem('roopshield_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.token || null;
  } catch {
    return null;
  }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request(method, path, body = null) {
  const token = getToken();

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body !== null) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (res.status === 401) {
    // Token expired or invalid — clear session and redirect
    sessionStorage.removeItem('roopshield_session');
    window.location.href = '/login';
    return;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data;
}

const api = {
  get:    (path)         => request('GET',    path),
  post:   (path, body)   => request('POST',   path, body),
  put:    (path, body)   => request('PUT',    path, body),
  patch:  (path, body)   => request('PATCH',  path, body),
  delete: (path)         => request('DELETE', path),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email, password, role) =>
    api.post('/auth/login', { email, password, role }),

  me: () => api.get('/auth/me'),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, newPassword }),

  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// ─── Interns ──────────────────────────────────────────────────────────────────

export const internsApi = {
  getAll: () => api.get('/interns'),

  add: (data) => api.post('/interns', data),

  update: (id, data) => api.put(`/interns/${id}`, data),

  delete: (id) => api.delete(`/interns/${id}`),

  bulkStatus: (ids, status) => api.patch('/interns/bulk-status', { ids, status }),

  resetPassword: (id) => api.post(`/interns/${id}/reset-password`, {}),
};

// ─── Attendance ───────────────────────────────────────────────────────────────

export const attendanceApi = {
  getAll: () => api.get('/attendance'),

  mark: (data) => api.post('/attendance', data),

  delete: (id) => api.delete(`/attendance/${id}`),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasksApi = {
  getAll: () => api.get('/tasks'),

  add: (data) => api.post('/tasks', data),

  update: (id, data) => api.put(`/tasks/${id}`, data),

  delete: (id) => api.delete(`/tasks/${id}`),

  addWorkLog: (taskId, data) => api.post(`/tasks/${taskId}/work-log`, data),
};

// ─── HR ───────────────────────────────────────────────────────────────────────

export const hrApi = {
  // Leave
  getLeave: () => api.get('/hr/leave'),
  submitLeave: (data) => api.post('/hr/leave', data),
  updateLeave: (id, data) => api.patch(`/hr/leave/${id}`, data),
  deleteLeave: (id) => api.delete(`/hr/leave/${id}`),

  // Notices
  getNotices: () => api.get('/hr/notices'),
  addNotice: (data) => api.post('/hr/notices', data),
  deleteNotice: (id) => api.delete(`/hr/notices/${id}`),

  // Documents
  getDocuments: () => api.get('/hr/documents'),
  addDocument: (data) => api.post('/hr/documents', data),
  deleteDocument: (id) => api.delete(`/hr/documents/${id}`),
};

// ─── Announcements ────────────────────────────────────────────────────────────

export const announcementsApi = {
  getAll: () => api.get('/announcements'),
  add: (data) => api.post('/announcements', data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

// ─── Departments ──────────────────────────────────────────────────────────────

export const departmentsApi = {
  getAll: () => api.get('/departments'),
  add: (name) => api.post('/departments', { name }),
  delete: (name) => api.delete(`/departments/${encodeURIComponent(name)}`),
};

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const doubtsApi = {
  getAll: () => api.get('/doubts'),
  add: (data) => api.post('/doubts', data),
  answer: (id, answer) => api.patch(`/doubts/${id}/answer`, { answer }),
  delete: (id) => api.delete(`/doubts/${id}`),
};

export const resourcesApi = {
  getAll: () => api.get('/resources'),
  add: (data) => api.post('/resources', data),
  delete: (id) => api.delete(`/resources/${id}`),
};

export const guidesApi = {
  getAll: () => api.get('/guides'),
  add: (data) => api.post('/guides', data),
  delete: (id) => api.delete(`/guides/${id}`),
};

export const ratingsApi = {
  getAll: () => api.get('/ratings'),
  add: (data) => api.post('/ratings', data),
};

export const credentialsApi = {
  getAll: () => api.get('/credentials'),
  updatePassword: (id, newPassword) => api.patch(`/credentials/${id}/password`, { newPassword }),
  generatePassword: (id) => api.post(`/credentials/${id}/generate-password`, {}),
};

export default api;
