// src/services/notificationService.js
import api from './api';

export const notificationService = {
  getAll: (params = {}) => api.get('/notifications', { params }).then((r) => r.data),
  create: (data) => api.post('/notifications', data).then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
  resolve: (id) => api.patch(`/notifications/${id}/resolve`).then((r) => r.data),
  remove: (id) => api.delete(`/notifications/${id}`).then((r) => r.data),
};
