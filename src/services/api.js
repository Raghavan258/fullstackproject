// API service for Know Your Constitution

const BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const stored = localStorage.getItem('constitutionAuth');
  if (stored) {
    try {
      const authData = JSON.parse(stored);
      if (authData.token) headers['Authorization'] = `Bearer ${authData.token}`;
    } catch (err) {
      console.error('Failed to parse auth token', err);
    }
  }
  return headers;
};

const handleResponse = async (res) => {
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; }
  catch { throw new Error('Invalid JSON response from server'); }
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Server error: ${res.status}`);
  }
  return json;
};

export const api = {
  get: (endpoint) =>
    fetch(`${BASE_URL}${endpoint}`, { method: 'GET', headers: getHeaders() }).then(handleResponse),

  post: (endpoint, data) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
    }).then(handleResponse),

  put: (endpoint, data) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data),
    }).then(handleResponse),

  patch: (endpoint, data) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }).then(handleResponse),

  delete: (endpoint) =>
    fetch(`${BASE_URL}${endpoint}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
};

// ── Query workflow ────────────────────────────────────────────────────────────
export const queryApi = {
  submit: (question)        => api.post('/queries', { question }),
  getMine: ()               => api.get('/queries/my'),
  getAll: (params = '')     => api.get(`/queries?${params}`),
  selfAssign: (id)          => api.patch(`/queries/${id}/self-assign`),
  assign: (id, userId)      => api.patch(`/queries/${id}/assign?userId=${userId}`),
  answer: (id, answer)      => api.patch(`/queries/${id}/answer`, { answer }),
  close: (id)               => api.patch(`/queries/${id}/close`),
  remove: (id)              => api.delete(`/queries/${id}`),
};

// ── Study Note approval workflow ──────────────────────────────────────────────
export const studyNoteApi = {
  getAll: (page = 0, size = 10) => api.get(`/study-notes?page=${page}&size=${size}`),
  getMine: ()                   => api.get('/study-notes/mine'),
  getPending: ()                => api.get('/study-notes/pending'),
  create: (data)                => api.post('/study-notes', data),
  update: (id, data)            => api.put(`/study-notes/${id}`, data),
  updateVideo: (id, videoUrl)   => api.patch(`/study-notes/${id}/video?videoUrl=${encodeURIComponent(videoUrl)}`),
  approve: (id)                 => api.patch(`/study-notes/${id}/approve`),
  reject: (id, reason = '')     => api.patch(`/study-notes/${id}/reject?reason=${encodeURIComponent(reason)}`),
  remove: (id)                  => api.delete(`/study-notes/${id}`),
};

// ── Article legal tools ───────────────────────────────────────────────────────
export const articleApi = {
  getAll: (page = 0)            => api.get(`/articles?page=${page}&size=20`),
  getFlagged: ()                => api.get('/articles/flagged'),
  saveCommentary: (id, legalCommentary) =>
                                   api.patch(`/articles/${id}/legal-commentary`, { legalCommentary }),
  flag: (id)                    => api.patch(`/articles/${id}/flag`),
  unflag: (id)                  => api.patch(`/articles/${id}/unflag`),
  remove: (id)                  => api.delete(`/articles/${id}`),
};

// ── Admin tools ───────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: ()              => api.get('/admin/stats'),
  getUsers: (role = '')     => api.get(`/admin/users${role ? `?role=${role}` : ''}`),
  toggleActive: (id)        => api.patch(`/admin/users/${id}/toggle-active`),
  updateRole: (id, role)    => api.patch(`/admin/users/${id}/role?role=${role}`),
  deleteUser: (id)          => api.delete(`/admin/users/${id}`),
};
