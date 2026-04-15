const BASE_URL = 'http://localhost:8080/api';

const getToken = () => localStorage.getItem('token');

export const apiFetch = async (path, options = {}) => {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  if (!res.ok) {
    let msg = 'Request failed';
    try { const j = await res.json(); msg = j.message || msg; } catch { /* plain text */ }
    throw new Error(msg);
  }

  return res.json();
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:  (data) => apiFetch('/auth/login',  { method: 'POST', body: JSON.stringify(data) }),
  signup: (data) => apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Projects ──────────────────────────────────────────────────────────────────
export const projectAPI = {
  list:      ()            => apiFetch('/projects'),
  create:    (name)        => apiFetch('/projects', { method: 'POST', body: JSON.stringify({ name }) }),
  addMember: (id, email)   => apiFetch(`/projects/${id}/members`, { method: 'POST', body: JSON.stringify({ email }) }),
  progress:  (id)          => apiFetch(`/projects/${id}/progress`),
  members:   (id)          => apiFetch(`/projects/${id}/members`),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const taskAPI = {
  list:     (projectId)       => apiFetch(`/projects/${projectId}/tasks`),
  create:   (projectId, data) => apiFetch(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  complete: (taskId)          => apiFetch(`/tasks/${taskId}/complete`, { method: 'PUT' }),
  assign:   (taskId, userId)  => apiFetch(`/tasks/${taskId}/assign`,  { method: 'PUT', body: JSON.stringify({ userId }) }),
};

// ── Comments ──────────────────────────────────────────────────────────────────
export const commentAPI = {
  list:  (taskId)          => apiFetch(`/tasks/${taskId}/comments`),
  add:   (taskId, content) => apiFetch(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  profile:     ()         => apiFetch('/users/me'),
  team:        ()         => apiFetch('/users/team'),
  memberTasks: (memberId) => apiFetch(`/users/${memberId}/tasks`),
};