// Lightweight API client with token injection
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('nscc_token');
}

async function request(method, path, body = null, params = null) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )).toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Auth
export const auth = {
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  register: (data) => request('POST', '/auth/register', data),
  me: () => request('GET', '/auth/me'),
};

// Books
export const books = {
  list: (params) => request('GET', '/books', null, params),
  get: (id) => request('GET', `/books/${id}`),
  create: (data) => request('POST', '/books', data),
  update: (id, data) => request('PUT', `/books/${id}`, data),
  delete: (id) => request('DELETE', `/books/${id}`),
  categories: () => request('GET', '/books/categories'),
};

// Transactions
export const transactions = {
  list: (params) => request('GET', '/transactions', null, params),
  get: (id) => request('GET', `/transactions/${id}`),
  issue: (data) => request('POST', '/transactions/issue', data),
  return: (data) => request('POST', '/transactions/return', data),
  scan: (book_id) => request('POST', '/transactions/scan', { book_id }),
};

// Stats
export const stats = {
  get: () => request('GET', '/stats'),
};

// Export (direct download)
export const exportData = {
  csv: (params = {}) => {
    const token = getToken();
    const qs = new URLSearchParams(params).toString();
    const url = `${BASE_URL}/export/csv${qs ? `?${qs}` : ''}`;
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', '');
    // Fetch with auth header
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `nscc-library-${Date.now()}.csv`;
        link.click();
      });
  },
  excel: (params = {}) => {
    const token = getToken();
    const qs = new URLSearchParams(params).toString();
    const url = `${BASE_URL}/export/excel${qs ? `?${qs}` : ''}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `nscc-library-report-${Date.now()}.xlsx`;
        link.click();
      });
  },
};

// AI
export const ai = {
  chat: (message, history) => request('POST', '/ai/chat', { message, history }),
  search: (query) => request('POST', '/ai/search', { query }),
  autofill: (title) => request('POST', '/ai/autofill', { title }),
  recommend: (data) => request('POST', '/ai/recommend', data),
};
