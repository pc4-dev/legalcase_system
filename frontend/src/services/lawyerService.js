// src/services/lawyerService.js
import api from './api';

export const lawyerService = {
  getAll: () => api.get('/lawyers').then((r) => r.data),
  getOne: (id) => api.get(`/lawyers/${id}`).then((r) => r.data),
  create: (data) => api.post('/lawyers', data).then((r) => r.data),
  update: (id, data) => api.put(`/lawyers/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/lawyers/${id}`).then((r) => r.data),
  getStats: () => api.get('/lawyers/stats').then((r) => r.data),
};
