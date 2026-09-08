// Resilient API client with seamless local-first fallback
import { localStore } from './data/localStore';

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

  // If Vercel or server returns 405 / 404 or HTML SPA rewrite, throw specifically so local-first handler catches it
  const contentType = res.headers.get('content-type') || '';
  if (res.status === 405 || res.status === 404 || !contentType.includes('application/json')) {
    const err = new Error(`HTTP ${res.status}: Non-JSON or unsupported response`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ── Auth API ──
export const auth = {
  login: async (email, password) => {
    try {
      return await request('POST', '/auth/login', { email, password });
    } catch (err) {
      console.warn('API /auth/login unavailable, using local-first engine:', err.message);
      return localStore.login(email, password);
    }
  },
  register: async (data) => {
    try {
      return await request('POST', '/auth/register', data);
    } catch (err) {
      console.warn('API /auth/register unavailable, using local-first engine:', err.message);
      return localStore.register(data);
    }
  },
  me: async () => {
    try {
      return await request('GET', '/auth/me');
    } catch (err) {
      return localStore.me();
    }
  },
};

// ── Books API ──
export const books = {
  list: async (params) => {
    try {
      return await request('GET', '/books', null, params);
    } catch (err) {
      console.warn('API /books unavailable, using local-first engine');
      return localStore.listBooks(params);
    }
  },
  getAll: async (params) => {
    try {
      const res = await books.list(params);
      return Array.isArray(res) ? res : (res.books || []);
    } catch (err) {
      const res = localStore.listBooks(params);
      return Array.isArray(res) ? res : (res.books || []);
    }
  },
  get: async (id) => {
    try {
      return await request('GET', `/books/${id}`);
    } catch (err) {
      return localStore.getBook(id);
    }
  },
  create: async (data) => {
    try {
      return await request('POST', '/books', data);
    } catch (err) {
      return localStore.createBook(data);
    }
  },
  update: async (id, data) => {
    try {
      return await request('PUT', `/books/${id}`, data);
    } catch (err) {
      return localStore.updateBook(id, data);
    }
  },
  delete: async (id) => {
    try {
      return await request('DELETE', `/books/${id}`);
    } catch (err) {
      return localStore.deleteBook(id);
    }
  },
  categories: async () => {
    try {
      return await request('GET', '/books/categories');
    } catch (err) {
      return localStore.getCategories();
    }
  },
};

// ── Transactions API ──
export const transactions = {
  list: async (params) => {
    try {
      return await request('GET', '/transactions', null, params);
    } catch (err) {
      console.warn('API /transactions unavailable, using local-first engine');
      return localStore.listTransactions(params);
    }
  },
  getAll: async (params) => {
    try {
      const res = await transactions.list(params);
      return Array.isArray(res) ? res : (res.transactions || []);
    } catch (err) {
      const res = localStore.listTransactions(params);
      return Array.isArray(res) ? res : (res.transactions || []);
    }
  },
  get: async (id) => {
    try {
      return await request('GET', `/transactions/${id}`);
    } catch (err) {
      const list = localStore.listTransactions();
      const t = list.transactions.find(item => item.id === id);
      if (!t) throw new Error('Transaction not found');
      return { transaction: t };
    }
  },
  issue: async (data) => {
    try {
      return await request('POST', '/transactions/issue', data);
    } catch (err) {
      console.warn('API /transactions/issue unavailable, using local-first engine');
      return localStore.issueBook(data);
    }
  },
  return: async (data) => {
    try {
      return await request('POST', '/transactions/return', data);
    } catch (err) {
      console.warn('API /transactions/return unavailable, using local-first engine');
      return localStore.returnBook(data);
    }
  },
  scan: async (book_id) => {
    try {
      return await request('POST', '/transactions/scan', { book_id });
    } catch (err) {
      return localStore.scanBook(book_id);
    }
  },
};

// ── Stats API ──
export const stats = {
  get: async () => {
    try {
      return await request('GET', '/stats');
    } catch (err) {
      console.warn('API /stats unavailable, using local-first engine');
      return localStore.getStats();
    }
  },
};

// ── Export (Browser-Direct & Server) ──
export const exportData = {
  csv: (params = {}) => {
    try {
      localStore.exportCSV();
    } catch (err) {
      console.error('CSV export failed:', err);
    }
  },
  excel: (params = {}) => {
    try {
      localStore.exportCSV();
    } catch (err) {
      console.error('Excel export failed:', err);
    }
  },
};

// ── AI API ──
export const ai = {
  chat: async (message, history) => {
    try {
      return await request('POST', '/ai/chat', { message, history });
    } catch (err) {
      return localStore.aiChat(message, history);
    }
  },
  search: async (query) => {
    try {
      return await request('POST', '/ai/search', { query });
    } catch (err) {
      return localStore.aiSearch(query);
    }
  },
};
