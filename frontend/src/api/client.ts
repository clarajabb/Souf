import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fm_token');
      localStorage.removeItem('fm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: Record<string, unknown>) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

// ── Listings ──────────────────────────────────────────────────────────────────
export const listingsApi = {
  getAll: (params: Record<string, unknown> = {}) =>
    api.get('/listings', { params }),
  getById: (id: string) => api.get(`/listings/${id}`),
  create: (data: Record<string, unknown>) => api.post('/listings', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/listings/${id}`, data),
  delete: (id: string) => api.delete(`/listings/${id}`),
  uploadImages: (id: string, files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('images', f));
    return api.post(`/listings/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  create: (data: { listingId: string; quantityKg: number }) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
  confirmDelivery: (id: string) => api.post(`/orders/${id}/confirm-delivery`),
};

// ── Samples ───────────────────────────────────────────────────────────────────
export const samplesApi = {
  create: (listingId: string) => api.post('/samples', { listingId }),
  getAll: () => api.get('/samples'),
  updateStatus: (id: string, status: string) =>
    api.patch(`/samples/${id}/status`, { status }),
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const messagesApi = {
  getConversations: () => api.get('/messages'),
  getThread: (userId: string) => api.get(`/messages/${userId}`),
  send: (receiverId: string, content: string, orderId?: string) =>
    api.post('/messages', { receiverId, content, orderId }),
  markRead: (userId: string) => api.patch(`/messages/read/${userId}`),
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewsApi = {
  create: (data: { orderId: string; rating: number; comment?: string }) =>
    api.post('/reviews', data),
  getForUser: (userId: string) => api.get(`/reviews/${userId}`),
};

// ── Users / Suppliers ─────────────────────────────────────────────────────────
export const usersApi = {
  getSupplier: (id: string) => api.get(`/suppliers/${id}`),
  updateProfile: (data: Record<string, unknown>) => api.put('/profile', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  requestVerify: () => api.post('/profile/verify'),
};

export default api;
